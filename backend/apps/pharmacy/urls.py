from django.urls import path
from .views import (
    PharmacyProfileView,
    MedicineInventoryListCreateView,
    MedicineInventoryDetailView,
)

urlpatterns = [
    path("profile/", PharmacyProfileView.as_view(), name="pharmacy-profile"),
    path("inventory/", MedicineInventoryListCreateView.as_view(), name="medicine-inventory"),
    path("inventory/<int:pk>/", MedicineInventoryDetailView.as_view(), name="medicine-inventory-detail"),
]
