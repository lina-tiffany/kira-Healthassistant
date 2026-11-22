from decimal import Decimal

from django.db import transaction
from rest_framework import serializers

from apps.pharmacy.models import PharmacyProfile, MedicineInventory
from .models import MedicineOrder, MedicineOrderItem


class MedicineOrderItemSerializer(serializers.ModelSerializer):
    medicine_name = serializers.CharField(
        source="medicine.medicine_name", read_only=True
    )

    class Meta:
        model = MedicineOrderItem
        fields = ["id", "medicine", "medicine_name", "quantity", "unit_price", "subtotal"]
        read_only_fields = ["id", "unit_price", "subtotal"]


class MedicineOrderSerializer(serializers.ModelSerializer):
    items = MedicineOrderItemSerializer(many=True)
    pharmacy_name = serializers.CharField(
        source="pharmacy.pharmacy_name", read_only=True
    )

    class Meta:
        model = MedicineOrder
        fields = [
            "id", "patient", "pharmacy", "pharmacy_name", "items",
            "status", "payment_method", "insurance_provider",
            "insurance_member_number", "delivery_address", "notes",
            "total_amount", "created_at", "updated_at",
        ]
        read_only_fields = [
            "id", "patient", "status", "total_amount",
            "created_at", "updated_at",
        ]

    def validate(self, attrs):
        payment_method = attrs.get("payment_method")
        if payment_method == "insurance":
            if not attrs.get("insurance_provider"):
                raise serializers.ValidationError({
                    "insurance_provider": "Required when using insurance."
                })
            if not attrs.get("insurance_member_number"):
                raise serializers.ValidationError({
                    "insurance_member_number": "Required when using insurance."
                })

        items = self.initial_data.get("items", [])
        if not items:
            raise serializers.ValidationError({
                "items": "Add at least one medicine to your order."
            })

        return attrs

    @transaction.atomic
    def create(self, validated_data):
        items_data = validated_data.pop("items")
        pharmacy = validated_data["pharmacy"]

        if not pharmacy.is_verified:
            raise serializers.ValidationError(
                "This pharmacy is not verified."
            )

        order = MedicineOrder.objects.create(**validated_data)
        total = Decimal("0.00")

        for item_data in items_data:
            medicine_id = item_data["medicine"]
            quantity = item_data["quantity"]

            try:
                medicine = MedicineInventory.objects.select_for_update().get(
                    pk=medicine_id,
                    pharmacy=pharmacy,
                    quantity__gte=quantity,
                )
            except MedicineInventory.DoesNotExist:
                raise serializers.ValidationError({
                    "items": f"Medicine {medicine_id} is unavailable or has insufficient stock."
                })

            if quantity < 1:
                raise serializers.ValidationError({
                    "items": "Quantity must be at least one."
                })

            unit_price = medicine.price
            subtotal = unit_price * quantity

            MedicineOrderItem.objects.create(
                order=order,
                medicine=medicine,
                quantity=quantity,
                unit_price=unit_price,
                subtotal=subtotal,
            )
            total += subtotal

        order.total_amount = total
        order.save(update_fields=["total_amount"])
        return order
