from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from rest_framework import generics, status
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import CaregiverRelationship
from .serializers import CaregiverRelationshipSerializer

User = get_user_model()


class CaregiverRelationshipListCreateView(generics.ListCreateAPIView):
    serializer_class = CaregiverRelationshipSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return CaregiverRelationship.objects.filter(
            patient=user
        ) | CaregiverRelationship.objects.filter(caregiver=user)

    def perform_create(self, serializer):
        caregiver = self.request.user

        if caregiver.role != "caregiver":
            raise PermissionDenied("Only caregiver accounts can send requests.")

        patient_email = self.request.data.get("patient_email")
        if not patient_email:
            raise ValidationError({"patient_email": "This field is required."})

        patient = get_object_or_404(User, email__iexact=patient_email)

        if patient.pk == caregiver.pk:
            raise ValidationError("You cannot link your account to itself.")

        if patient.role != "patient":
            raise ValidationError("The selected account is not a patient.")

        relationship, created = CaregiverRelationship.objects.get_or_create(
            patient=patient,
            caregiver=caregiver,
            defaults={"status": "pending"},
        )

        if not created:
            if relationship.status == "approved":
                raise ValidationError("This caregiver relationship is already approved.")
            relationship.status = "pending"
            relationship.save(update_fields=["status", "updated_at"])

        self.created_relationship = relationship

    def create(self, request, *args, **kwargs):
        self.perform_create(None)
        serializer = self.get_serializer(self.created_relationship)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class CaregiverRequestResponseView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        relationship = get_object_or_404(
            CaregiverRelationship,
            pk=pk,
            patient=request.user,
            status="pending",
        )

        decision = request.data.get("decision")
        if decision not in ["approve", "reject"]:
            raise ValidationError({"decision": "Choose approve or reject."})

        relationship.status = "approved" if decision == "approve" else "rejected"
        relationship.save(update_fields=["status", "updated_at"])

        return Response(CaregiverRelationshipSerializer(relationship).data)


class CaregiverPermissionsView(APIView):
    permission_classes = [IsAuthenticated]

    ALLOWED_PERMISSIONS = [
        "can_view_medical_history",
        "can_view_medications",
        "can_view_appointments",
        "can_manage_reminders",
    ]

    def patch(self, request, pk):
        relationship = get_object_or_404(
            CaregiverRelationship,
            pk=pk,
            patient=request.user,
            status="approved",
        )

        for field in self.ALLOWED_PERMISSIONS:
            if field in request.data:
                value = request.data[field]
                if not isinstance(value, bool):
                    raise ValidationError({field: "Must be true or false."})
                setattr(relationship, field, value)

        relationship.save()
        return Response(CaregiverRelationshipSerializer(relationship).data)


class CaregiverRelationshipRevokeView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        relationship = get_object_or_404(
            CaregiverRelationship,
            pk=pk,
        )

        if request.user not in [relationship.patient, relationship.caregiver]:
            raise PermissionDenied("You cannot revoke this relationship.")

        relationship.status = "revoked"
        relationship.save(update_fields=["status", "updated_at"])

        return Response({"message": "Caregiver access has been revoked."})
