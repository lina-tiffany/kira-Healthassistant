from rest_framework import serializers
from .models import SymptomEntry


class SymptomEntrySerializer(serializers.ModelSerializer):

    class Meta:
        model = SymptomEntry
        fields = "__all__"
        read_only_fields = [
            "id",
            "patient",
            "recorded_at",
            "updated_at"
        ]

    def validate_severity(self, value):
        if value < 1 or value > 10:
            raise serializers.ValidationError(
                "Severity must be between 1 and 10."
            )
        return value
