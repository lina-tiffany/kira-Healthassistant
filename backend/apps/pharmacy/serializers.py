from rest_framework import serializers
from .models import PharmacyProfile, MedicineInventory


class PharmacyProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = PharmacyProfile
        fields = "__all__"
        read_only_fields = [
            "id", "owner", "is_verified", "created_at", "updated_at"
        ]


class MedicineInventorySerializer(serializers.ModelSerializer):
    pharmacy_name = serializers.CharField(
        source="pharmacy.pharmacy_name",
        read_only=True,
    )
    pharmacy_address = serializers.CharField(
        source="pharmacy.address",
        read_only=True,
    )
    pharmacy_phone = serializers.CharField(
        source="pharmacy.phone_number",
        read_only=True,
    )

    class Meta:
        model = MedicineInventory
        fields = "__all__"
        read_only_fields = [
            "id", "pharmacy", "is_available", "created_at", "updated_at",
            "pharmacy_name", "pharmacy_address", "pharmacy_phone",
        ]

    def validate_price(self, value):
        if value < 0:
            raise serializers.ValidationError("Price cannot be negative.")
        return value
