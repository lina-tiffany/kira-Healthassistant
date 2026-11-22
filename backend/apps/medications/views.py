from django.shortcuts import get_object_or_404
from django.db.models import Count, Q
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

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
        return Medication.objects.filter(patient__user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(
            patient=self.request.user.patient_profile,
            created_by=self.request.user,
        )


class MedicationDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = MedicationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Medication.objects.filter(patient__user=self.request.user)


class MedicationReminderListCreateView(generics.ListCreateAPIView):
    serializer_class = MedicationReminderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return MedicationReminder.objects.filter(
            medication__patient__user=self.request.user
        ).select_related("medication")

    def perform_create(self, serializer):
        medication = get_object_or_404(
            Medication,
            id=self.request.data.get("medication"),
            patient__user=self.request.user,
        )
        serializer.save(medication=medication)


class MedicationLogListCreateView(generics.ListCreateAPIView):
    serializer_class = MedicationLogSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return MedicationLog.objects.filter(
            medication__patient__user=self.request.user
        ).select_related("medication")

    def perform_create(self, serializer):
        medication = get_object_or_404(
            Medication,
            id=self.request.data.get("medication"),
            patient__user=self.request.user,
        )
        serializer.save(medication=medication)


class MedicationAdherenceView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        logs = MedicationLog.objects.filter(
            medication__patient__user=request.user
        )

        summary = logs.aggregate(
            total=Count("id"),
            taken=Count("id", filter=Q(status="taken")),
            missed=Count("id", filter=Q(status="missed")),
            skipped=Count("id", filter=Q(status="skipped")),
        )

        total = summary["total"]
        summary["adherence_percentage"] = (
            round(summary["taken"] / total * 100, 2)
            if total else 0
        )

        return Response(summary)
