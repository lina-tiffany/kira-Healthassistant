from datetime import timedelta

from django.db.models import Avg, Count
from django.utils import timezone

from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import WellnessEntry
from .serializers import WellnessEntrySerializer


class WellnessListCreateView(generics.ListCreateAPIView):
    serializer_class = WellnessEntrySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = WellnessEntry.objects.filter(
            patient__user=self.request.user
        )

        start_date = self.request.query_params.get("start_date")
        end_date = self.request.query_params.get("end_date")

        if start_date:
            queryset = queryset.filter(entry_date__gte=start_date)
        if end_date:
            queryset = queryset.filter(entry_date__lte=end_date)

        return queryset

    def perform_create(self, serializer):
        serializer.save(patient=self.request.user.patient_profile)


class WellnessDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = WellnessEntrySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return WellnessEntry.objects.filter(
            patient__user=self.request.user
        )


class WellnessSummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        today = timezone.localdate()
        start_date = today - timedelta(days=6)

        entries = WellnessEntry.objects.filter(
            patient__user=request.user,
            entry_date__gte=start_date,
            entry_date__lte=today,
        )

        summary = entries.aggregate(
            days_tracked=Count("id"),
            average_sleep_hours=Avg("sleep_hours"),
            average_water_intake_liters=Avg("water_intake_liters"),
            average_activity_minutes=Avg("physical_activity_minutes"),
            average_energy_level=Avg("energy_level"),
            average_stress_level=Avg("stress_level"),
        )

        for key, value in summary.items():
            if isinstance(value, float):
                summary[key] = round(value, 2)

        summary["mood_distribution"] = list(
            entries.values("mood").annotate(count=Count("id")).order_by("mood")
        )

        summary["period"] = {
            "start": start_date.isoformat(),
            "end": today.isoformat(),
        }

        return Response(summary)
