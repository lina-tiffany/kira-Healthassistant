from django.conf import settings
from django.db import models


class MedicineOrder(models.Model):
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("accepted", "Accepted"),
        ("preparing", "Preparing"),
        ("ready", "Ready for collection"),
        ("out_for_delivery", "Out for delivery"),
        ("completed", "Completed"),
        ("cancelled", "Cancelled"),
        ("rejected", "Rejected"),
    ]

    PAYMENT_CHOICES = [
        ("full", "Full payment"),
        ("insurance", "Insurance"),
    ]

    patient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="medicine_orders",
    )
    pharmacy = models.ForeignKey(
        "pharmacy.PharmacyProfile",
        on_delete=models.PROTECT,
        related_name="orders",
    )
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default="pending"
    )
    payment_method = models.CharField(
        max_length=20, choices=PAYMENT_CHOICES
    )
    insurance_provider = models.CharField(max_length=150, blank=True)
    insurance_member_number = models.CharField(max_length=100, blank=True)
    delivery_address = models.TextField(blank=True)
    notes = models.TextField(blank=True)
    total_amount = models.DecimalField(
        max_digits=12, decimal_places=2, default=0
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Order #{self.pk} - {self.patient}"


class MedicineOrderItem(models.Model):
    order = models.ForeignKey(
        MedicineOrder,
        on_delete=models.CASCADE,
        related_name="items",
    )
    medicine = models.ForeignKey(
        "pharmacy.MedicineInventory",
        on_delete=models.PROTECT,
    )
    quantity = models.PositiveIntegerField()
    unit_price = models.DecimalField(max_digits=12, decimal_places=2)
    subtotal = models.DecimalField(max_digits=12, decimal_places=2)

    def __str__(self):
        return f"{self.medicine.medicine_name} x {self.quantity}"
