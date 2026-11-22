from django.contrib import admin
from .models import PharmacyProfile, MedicineInventory


@admin.register(PharmacyProfile)
class PharmacyProfileAdmin(admin.ModelAdmin):
    list_display = ("pharmacy_name", "owner", "license_number", "is_verified")
    list_filter = ("is_verified",)
    search_fields = ("pharmacy_name", "license_number", "owner__email")


@admin.register(MedicineInventory)
class MedicineInventoryAdmin(admin.ModelAdmin):
    list_display = (
        "medicine_name", "pharmacy", "quantity", "price",
        "currency", "is_available",
    )
    list_filter = ("is_available", "requires_prescription")
    search_fields = ("medicine_name", "generic_name")
