from django.conf import settings
from django.db import models


class PharmacyProfile(models.Model):
    owner = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="pharmacy_profile",
    )
    pharmacy_name = models.CharField(max_length=200)
    license_number = models.CharField(max_length=100, unique=True)
    address = models.TextField()
    phone_number = models.CharField(max_length=30)
    opening_hours = models.CharField(max_length=200, blank=True)
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.pharmacy_name


class MedicineInventory(models.Model):
    pharmacy = models.ForeignKey(
        PharmacyProfile,
        on_delete=models.CASCADE,
        related_name="inventory",
    )
    medicine_name = models.CharField(max_length=200)
    generic_name = models.CharField(max_length=200, blank=True)
    strength = models.CharField(max_length=100, blank=True)
    dosage_form = models.CharField(max_length=100, blank=True)
    quantity = models.PositiveIntegerField(default=0)
    price = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=3, default="RWF")
    requires_prescription = models.BooleanField(default=False)
    is_available = models.BooleanField(default=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["medicine_name"]
        indexes = [
            models.Index(fields=["medicine_name"]),
            models.Index(fields=["generic_name"]),
        ]

    def save(self, *args, **kwargs):
        self.is_available = self.quantity > 0
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.medicine_name} - {self.pharmacy.pharmacy_name}"
