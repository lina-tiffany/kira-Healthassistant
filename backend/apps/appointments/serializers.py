from rest_framework import serializers
from .models import Appointment


class AppointmentSerializer(serializers.ModelSerializer):

    class Meta:
        model = Appointment
        fields = "__all__"
        read_only_fields = [
            "id",
            "patient",
            "created_at",
            "updated_at"
        ]

    def validate(self, attrs):
        appointment_date = attrs.get(
            "appointment_date",
            getattr(self.instance, "appointment_date", None)
        )

        appointment_time = attrs.get(
            "appointment_time",
            getattr(self.instance, "appointment_time", None)
        )

        if appointment_date and appointment_time:
            from datetime import datetime
            from django.utils import timezone

            appointment_datetime = timezone.make_aware(
                datetime.combine(appointment_date, appointment_time)
            )

            if appointment_datetime <= timezone.now():
                raise serializers.ValidationError(
                    "Appointment must be scheduled for a future date and time."
                )

        return attrs
