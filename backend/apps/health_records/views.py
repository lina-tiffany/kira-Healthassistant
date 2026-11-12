from rest_framework import generics
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
            return HealthRecord.objects.filter(
                patient=user.patient_profile
            )

        return HealthRecord.objects.filter(
            patient__caregiver_relationships__caregiver=user,
            patient__caregiver_relationships__status="approved",
            patient__caregiver_relationships__can_view_medical_history=True
        ).distinct()

    def perform_create(self, serializer):
        serializer.save(
            patient=self.request.user.patient_profile,
            created_by=self.request.user
        )


class HealthRecordDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = HealthRecord.objects.all()
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
            patient__caregiver_relationships__can_view_medical_history=True
        ).distinct()
