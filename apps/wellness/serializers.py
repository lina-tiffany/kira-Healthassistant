from rest_framework import serializers
from .models import WellnessEntry


class WellnessEntrySerializer(serializers.ModelSerializer):

    class Meta:
        model = WellnessEntry
        fields = "__all__"
        read_only_fields = ["id", "patient", "created_at"]

    def validate(self, attrs):
        for field in ["energy_level", "stress_level"]:
            value = attrs.get(field)
            if value is not None and not 1 <= value <= 10:
                raise serializers.ValidationError({
                    field: "Value must be between 1 and 10."
                })
        return attrs
