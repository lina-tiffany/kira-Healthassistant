from rest_framework import serializers
from .models import Medication, MedicationReminder, MedicationLog


class MedicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Medication
        fields = "__all__"
        read_only_fields = [
            "id",
            "patient",
            "created_by",
            "created_at",
            "updated_at",
        ]


class MedicationReminderSerializer(serializers.ModelSerializer):
    class Meta:
        model = MedicationReminder
        fields = "__all__"
        read_only_fields = ["id", "medication", "created_at"]


class MedicationLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = MedicationLog
        fields = "__all__"
        read_only_fields = ["id", "medication", "taken_at"]
