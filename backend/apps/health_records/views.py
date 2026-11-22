from django.db.models import Q
from rest_framework import generics
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated

from .models import HealthRecord
from .serializers import HealthRecordSerializer
from .permissions import HealthRecordPermission


class HealthRecordListCreateView(generics.ListCreateAPIView):
    serializer_class = HealthRecordSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if hasattr(user, "patient_profile"):
            queryset = HealthRecord.objects.filter(
                patient=user.patient_profile
            )
        else:
            queryset = HealthRecord.objects.filter(
                patient__caregiver_relationships__caregiver=user,
                patient__caregiver_relationships__status="approved",
                patient__caregiver_relationships__can_view_medical_history=True,
            ).distinct()

        record_type = self.request.query_params.get("record_type")
        if record_type:
            queryset = queryset.filter(record_type=record_type)

        start_date = self.request.query_params.get("start_date")
        if start_date:
            queryset = queryset.filter(record_date__gte=start_date)

        end_date = self.request.query_params.get("end_date")
        if end_date:
            queryset = queryset.filter(record_date__lte=end_date)

        search = self.request.query_params.get("search")
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search)
                | Q(description__icontains=search)
                | Q(diagnosis__icontains=search)
                | Q(treatment__icontains=search)
                | Q(doctor_name__icontains=search)
                | Q(healthcare_facility__icontains=search)
            )

        return queryset.select_related("patient", "created_by")

    def perform_create(self, serializer):
        if not hasattr(self.request.user, "patient_profile"):
            raise PermissionDenied(
                "Only patients can create their own health records."
            )

        serializer.save(
            patient=self.request.user.patient_profile,
            created_by=self.request.user,
        )


class HealthRecordDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = HealthRecordSerializer
    permission_classes = [IsAuthenticated, HealthRecordPermission]

    def get_queryset(self):
        user = self.request.user

        if hasattr(user, "patient_profile"):
            return HealthRecord.objects.filter(
                patient=user.patient_profile
            )

        return HealthRecord.objects.filter(
            patient__caregiver_relationships__caregiver=user,
            patient__caregiver_relationships__status="approved",
            patient__caregiver_relationships__can_view_medical_history=True,
        ).distinct()
