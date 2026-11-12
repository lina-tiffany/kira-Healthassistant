from django.db import models


class SymptomEntry(models.Model):

    STATUS_CHOICES = [
        ("ongoing", "Ongoing"),
        ("improving", "Improving"),
        ("resolved", "Resolved"),
    ]

    patient = models.ForeignKey(
        "patients.PatientProfile",
        on_delete=models.CASCADE,
        related_name="symptom_entries"
    )

    symptom_name = models.CharField(max_length=150)
    severity = models.PositiveSmallIntegerField()
    description = models.TextField(blank=True)
    onset_date = models.DateField()
    duration = models.CharField(max_length=100, blank=True)
    triggers = models.TextField(blank=True)
    associated_symptoms = models.TextField(blank=True)

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="ongoing"
    )

    recorded_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-recorded_at"]

    def __str__(self):
        return f"{self.symptom_name} - Severity {self.severity}"
