from datetime import datetime, timedelta

from django.core.management.base import BaseCommand
from django.utils import timezone

from apps.appointments.models import Appointment
from apps.notifications.models import Notification


class Command(BaseCommand):
    help = "Send appointment notifications 24 hours before appointments."

    def handle(self, *args, **options):
        now = timezone.localtime()

        window_start = (now + timedelta(hours=24)).replace(
            second=0,
            microsecond=0,
        )
        window_end = window_start + timedelta(minutes=1)

        appointments = Appointment.objects.filter(
            status__in=["scheduled", "confirmed"],
            appointment_date=window_start.date(),
        ).select_related("patient", "patient__user")

        created = 0

        for appointment in appointments:
            appointment_datetime = timezone.make_aware(
                datetime.combine(
                    appointment.appointment_date,
                    appointment.appointment_time,
                ),
                timezone.get_current_timezone(),
            )

            if not window_start <= appointment_datetime < window_end:
                continue

            patient_user = appointment.patient.user

            action_url = f"appointment-reminder:{appointment.pk}"

            if Notification.objects.filter(
                recipient=patient_user,
                action_url=action_url,
            ).exists():
                continue

            Notification.objects.create(
                recipient=patient_user,
                category="appointment",
                title="Upcoming appointment",
                message=(
                    f"You have an appointment with "
                    f"{appointment.provider_name} tomorrow at "
                    f"{appointment.appointment_time.strftime('%H:%M')} "
                    f"at {appointment.healthcare_facility}."
                ),
                action_url=action_url,
            )

            created += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Appointment reminders created: {created}"
            )
        )
