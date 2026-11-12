from django.db import models


class Appointment(models.Model):

    STATUS_CHOICES = [
        ("scheduled", "Scheduled"),
        ("confirmed", "Confirmed"),
        ("completed", "Completed"),
        ("cancelled", "Cancelled"),
        ("rescheduled", "Rescheduled"),
    ]

    APPOINTMENT_TYPES = [
        ("consultation", "Consultation"),
        ("follow_up", "Follow-up"),
        ("checkup", "General Checkup"),
        ("laboratory", "Laboratory"),
        ("emergency", "Emergency"),
        ("other", "Other"),
    ]

    patient = models.ForeignKey(
        "patients.PatientProfile",
        on_delete=models.CASCADE,
        related_name="appointments"
    )

    provider_name = models.CharField(max_length=150)
    healthcare_facility = models.CharField(max_length=200)
    appointment_type = models.CharField(
        max_length=30,
        choices=APPOINTMENT_TYPES
    )

    appointment_date = models.DateField()
    appointment_time = models.TimeField()
    reason = models.TextField(blank=True)
    notes = models.TextField(blank=True)

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="scheduled"
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["appointment_date", "appointment_time"]

    def __str__(self):
        return f"{self.patient.user} - {self.appointment_date}"
