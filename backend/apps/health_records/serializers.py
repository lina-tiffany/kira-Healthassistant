from rest_framework import serializers
from .models import HealthRecord


class HealthRecordSerializer(serializers.ModelSerializer):

    class Meta:
        model = HealthRecord
        fields = "__all__"
        read_only_fields = [
            "id",
            "patient",
            "created_by",
            "created_at",
            "updated_at",
        ]
