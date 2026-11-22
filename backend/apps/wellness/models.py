from django.db import models


class WellnessEntry(models.Model):

    MOOD_CHOICES = [
        ("very_good", "Very Good"),
        ("good", "Good"),
        ("neutral", "Neutral"),
        ("low", "Low"),
        ("very_low", "Very Low"),
    ]

    patient = models.ForeignKey(
        "patients.PatientProfile",
        on_delete=models.CASCADE,
        related_name="wellness_entries"
    )

    entry_date = models.DateField()
    mood = models.CharField(max_length=20, choices=MOOD_CHOICES)
    sleep_hours = models.DecimalField(
        max_digits=4, decimal_places=2, null=True, blank=True
    )
    water_intake_liters = models.DecimalField(
        max_digits=4, decimal_places=2, null=True, blank=True
    )
    physical_activity_minutes = models.PositiveIntegerField(default=0)
    energy_level = models.PositiveSmallIntegerField(null=True, blank=True)
    stress_level = models.PositiveSmallIntegerField(null=True, blank=True)
    notes = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-entry_date"]
        constraints = [
            models.UniqueConstraint(
                fields=["patient", "entry_date"],
                name="unique_patient_wellness_entry_per_day"
            )
        ]

    def __str__(self):
        return f"{self.patient.user} - {self.entry_date}"
