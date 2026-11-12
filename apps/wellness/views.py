from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from .models import WellnessEntry
from .serializers import WellnessEntrySerializer


class WellnessListCreateView(generics.ListCreateAPIView):
    serializer_class = WellnessEntrySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return WellnessEntry.objects.filter(
            patient__user=self.request.user
        )

    def perform_create(self, serializer):
        serializer.save(patient=self.request.user.patient_profile)


class WellnessDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = WellnessEntrySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return WellnessEntry.objects.filter(
            patient__user=self.request.user
        )
