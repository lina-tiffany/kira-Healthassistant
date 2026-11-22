from django.conf import settings
from django.db import models


class CaregiverRelationship(models.Model):
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("approved", "Approved"),
        ("rejected", "Rejected"),
        ("revoked", "Revoked"),
    ]

    patient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="caregiver_relationships",
    )
    caregiver = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="patient_relationships",
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="pending",
    )
    can_view_medical_history = models.BooleanField(default=False)
    can_view_medications = models.BooleanField(default=False)
    can_view_appointments = models.BooleanField(default=False)
    can_manage_reminders = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["patient", "caregiver"],
                name="unique_patient_caregiver",
            )
        ]

    def __str__(self):
        return f"{self.caregiver} → {self.patient} ({self.status})"
