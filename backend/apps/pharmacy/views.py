from django.db.models import Q
from rest_framework import generics
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated

from .models import PharmacyProfile, MedicineInventory
from .serializers import (
    PharmacyProfileSerializer,
    MedicineInventorySerializer,
)


class PharmacyProfileView(generics.ListCreateAPIView):
    serializer_class = PharmacyProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return PharmacyProfile.objects.filter(owner=self.request.user)

    def perform_create(self, serializer):
        if hasattr(self.request.user, "pharmacy_profile"):
            raise PermissionDenied("You already have a pharmacy profile.")
        serializer.save(owner=self.request.user)


class MedicineInventoryListCreateView(generics.ListCreateAPIView):
    serializer_class = MedicineInventorySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = MedicineInventory.objects.select_related("pharmacy").filter(
            pharmacy__is_verified=True
        )

        search = self.request.query_params.get("search")
        if search:
            queryset = queryset.filter(
                Q(medicine_name__icontains=search)
                | Q(generic_name__icontains=search)
                | Q(strength__icontains=search)
            )

        available = self.request.query_params.get("available")
        if available == "true":
            queryset = queryset.filter(quantity__gt=0)

        return queryset

    def perform_create(self, serializer):
        try:
            pharmacy = self.request.user.pharmacy_profile
        except PharmacyProfile.DoesNotExist:
            raise PermissionDenied("Register a pharmacy profile first.")

        if not pharmacy.is_verified:
            raise PermissionDenied("Your pharmacy must be verified first.")

        serializer.save(pharmacy=pharmacy)


class MedicineInventoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = MedicineInventorySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return MedicineInventory.objects.filter(
            pharmacy__owner=self.request.user
        )
