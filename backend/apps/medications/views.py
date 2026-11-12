from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from .models import Medication, MedicationReminder, MedicationLog
from .serializers import (
    MedicationSerializer,
    MedicationReminderSerializer,
    MedicationLogSerializer,
)


class MedicationListCreateView(generics.ListCreateAPIView):
    serializer_class = MedicationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Medication.objects.filter(
            patient__user=self.request.user
        )

    def perform_create(self, serializer):
        serializer.save(
            patient=self.request.user.patient_profile,
            created_by=self.request.user
        )


class MedicationDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = MedicationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Medication.objects.filter(
            patient__user=self.request.user
        )


class MedicationReminderListCreateView(generics.ListCreateAPIView):
    serializer_class = MedicationReminderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return MedicationReminder.objects.filter(
            medication__patient__user=self.request.user
        )

    def perform_create(self, serializer):
        medication = Medication.objects.get(
            id=self.request.data.get("medication"),
            patient__user=self.request.user
        )
        serializer.save(medication=medication)


class MedicationLogListCreateView(generics.ListCreateAPIView):
    serializer_class = MedicationLogSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return MedicationLog.objects.filter(
            medication__patient__user=self.request.user
        )

    def perform_create(self, serializer):
        medication = Medication.objects.get(
            id=self.request.data.get("medication"),
            patient__user=self.request.user
        )
        serializer.save(medication=medication)
