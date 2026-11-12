from django.conf import settings
from django.db import models


class HealthRecord(models.Model):

    RECORD_TYPES = [
        ("diagnosis", "Diagnosis"),
        ("medical_history", "Medical History"),
        ("allergy", "Allergy"),
        ("doctor_instruction", "Doctor's Instruction"),
        ("lab_result", "Laboratory Result"),
        ("prescription", "Prescription"),
        ("other", "Other"),
    ]

    patient = models.ForeignKey(
        "patients.PatientProfile",
        on_delete=models.CASCADE,
        related_name="health_records"
    )

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="created_health_records"
    )

    record_type = models.CharField(
        max_length=30,
        choices=RECORD_TYPES
    )

    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    diagnosis = models.TextField(blank=True)
    treatment = models.TextField(blank=True)
    doctor_name = models.CharField(max_length=150, blank=True)
    healthcare_facility = models.CharField(max_length=200, blank=True)
    record_date = models.DateField()

    attachment = models.FileField(
        upload_to="health_records/",
        blank=True,
        null=True
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-record_date", "-created_at"]

    def __str__(self):
        return f"{self.title} - {self.patient.user}"
