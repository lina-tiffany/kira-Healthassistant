from django.conf import settings
from django.db import models


class Medication(models.Model):
    patient = models.ForeignKey(
        "patients.PatientProfile",
        on_delete=models.CASCADE,
        related_name="medications"
    )

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="created_medications"
    )

    name = models.CharField(max_length=200)
    dosage = models.CharField(max_length=100)
    frequency = models.CharField(max_length=150)
    route = models.CharField(max_length=100, blank=True)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    instructions = models.TextField(blank=True)
    prescribing_doctor = models.CharField(max_length=150, blank=True)
    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.name} - {self.patient.user.username}"


class MedicationReminder(models.Model):
    medication = models.ForeignKey(
        Medication,
        on_delete=models.CASCADE,
        related_name="reminders"
    )

    reminder_time = models.TimeField()
    days_of_week = models.CharField(max_length=100, blank=True)
    is_enabled = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["reminder_time"]

    def __str__(self):
        return f"{self.medication.name} at {self.reminder_time}"


class MedicationLog(models.Model):
    STATUS_CHOICES = [
        ("taken", "Taken"),
        ("missed", "Missed"),
        ("skipped", "Skipped"),
    ]

    medication = models.ForeignKey(
        Medication,
        on_delete=models.CASCADE,
        related_name="logs"
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="taken"
    )

    taken_at = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ["-taken_at"]

    def __str__(self):
        return f"{self.medication.name} - {self.status}"
