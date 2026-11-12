from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

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
        serializer.save(
            patient=self.request.user.patient_profile
        )


class SymptomDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = SymptomEntrySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return SymptomEntry.objects.filter(
            patient__user=self.request.user
        )
