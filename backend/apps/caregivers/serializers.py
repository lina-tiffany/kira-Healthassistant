from rest_framework import serializers
from .models import CaregiverRelationship


class CaregiverRelationshipSerializer(serializers.ModelSerializer):
    patient_email = serializers.EmailField(source="patient.email", read_only=True)
    caregiver_email = serializers.EmailField(source="caregiver.email", read_only=True)

    class Meta:
        model = CaregiverRelationship
        fields = [
            "id",
            "patient",
            "patient_email",
            "caregiver",
            "caregiver_email",
            "status",
            "can_view_medical_history",
            "can_view_medications",
            "can_view_appointments",
            "can_manage_reminders",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id", "patient", "caregiver", "status",
            "created_at", "updated_at",
        ]
