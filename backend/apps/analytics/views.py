from datetime import timedelta

from django.db.models import Avg, Count
from django.utils import timezone
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.appointments.models import Appointment
from apps.medications.models import Medication, MedicationLog
from apps.symptoms.models import SymptomEntry
from apps.wellness.models import WellnessEntry


class PatientDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        patient_profile = getattr(user, "patient_profile", None)

        if patient_profile is None:
            return Response(
                {"detail": "A patient profile is required for this dashboard."},
                status=403,
            )

        today = timezone.localdate()
        week_ago = today - timedelta(days=6)

        medications = Medication.objects.filter(
            patient=patient_profile,
            is_active=True,
        )

        logs = MedicationLog.objects.filter(
            medication__patient=patient_profile,
            taken_at__date__range=(week_ago, today),
        )

        total_logs = logs.count()
        taken_logs = logs.filter(status="taken").count()

        adherence = (
            round(taken_logs / total_logs * 100, 1)
            if total_logs else None
        )

        symptoms = SymptomEntry.objects.filter(patient=patient_profile)
        recent_symptoms = symptoms.filter(onset_date__gte=week_ago)

        wellness = WellnessEntry.objects.filter(
            patient=patient_profile,
            entry_date__range=(week_ago, today),
        )

        appointments = Appointment.objects.filter(
            patient=patient_profile,
            appointment_date__gte=today,
            status__in=["scheduled", "confirmed"],
        ).order_by("appointment_date", "appointment_time")

        symptom_summary = recent_symptoms.aggregate(
            total=Count("id"),
            average_severity=Avg("severity"),
        )

        wellness_summary = wellness.aggregate(
            average_sleep=Avg("sleep_hours"),
            average_water=Avg("water_intake_liters"),
            average_activity=Avg("physical_activity_minutes"),
        )

        return Response({
            "generated_at": timezone.now(),
            "period": {
                "start": week_ago,
                "end": today,
            },
            "medications": {
                "active_count": medications.count(),
                "adherence_percentage": adherence,
                "logged_doses": total_logs,
                "taken_doses": taken_logs,
                "missed_doses": logs.filter(status="missed").count(),
            },
            "symptoms": {
                "recent_count": symptom_summary["total"] or 0,
                "average_severity": (
                    round(symptom_summary["average_severity"], 1)
                    if symptom_summary["average_severity"] is not None
                    else None
                ),
                "ongoing_count": symptoms.filter(status="ongoing").count(),
            },
            "wellness": {
                "entries": wellness.count(),
                "average_sleep_hours": wellness_summary["average_sleep"],
                "average_water_liters": wellness_summary["average_water"],
                "average_activity_minutes": wellness_summary["average_activity"],
            },
            "upcoming_appointments": [
                {
                    "id": item.id,
                    "provider": item.provider_name,
                    "facility": item.healthcare_facility,
                    "date": item.appointment_date,
                    "time": item.appointment_time,
                    "status": item.status,
                }
                for item in appointments[:5]
            ],
        })
