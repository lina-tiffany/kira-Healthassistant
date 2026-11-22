from django.db.models import Avg, Count
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import SymptomEntry
from .serializers import SymptomEntrySerializer


class SymptomListCreateView(generics.ListCreateAPIView):
    serializer_class = SymptomEntrySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return SymptomEntry.objects.filter(
            patient__user=self.request.user
        )

    def perform_create(self, serializer):
        serializer.save(patient=self.request.user.patient_profile)


class SymptomDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = SymptomEntrySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return SymptomEntry.objects.filter(
            patient__user=self.request.user
        )


class SymptomAnalyticsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        entries = SymptomEntry.objects.filter(
            patient__user=request.user
        )

        summary = entries.aggregate(
            total_entries=Count("id"),
            average_severity=Avg("severity"),
        )

        summary["average_severity"] = (
            round(summary["average_severity"], 2)
            if summary["average_severity"] is not None else 0
        )

        summary["ongoing"] = entries.filter(status="ongoing").count()
        summary["improving"] = entries.filter(status="improving").count()
        summary["resolved"] = entries.filter(status="resolved").count()

        summary["severity_distribution"] = list(
            entries.values("severity")
            .annotate(count=Count("id"))
            .order_by("severity")
        )

        return Response(summary)
