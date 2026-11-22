from datetime import datetime

from django.core.management.base import BaseCommand
from django.utils import timezone

from apps.medications.models import MedicationReminder
from apps.notifications.models import Notification


class Command(BaseCommand):
    help = "Create notifications for medication reminders due now."

    def handle(self, *args, **options):
        now = timezone.localtime()
        today = now.date()
        current_time = now.time().replace(second=0, microsecond=0)

        day_names = [
            "monday", "tuesday", "wednesday",
            "thursday", "friday", "saturday", "sunday"
        ]

        created = 0

        reminders = MedicationReminder.objects.filter(
            is_enabled=True,
            reminder_time__hour=now.hour,
            reminder_time__minute=now.minute,
            medication__is_active=True,
        ).select_related("medication", "medication__patient")

        for reminder in reminders:
            days = (reminder.days_of_week or "").lower()
            selected_days = [
                day.strip() for day in days.replace(";", ",").split(",")
                if day.strip()
            ]

            if selected_days:
                valid_days = {
                    day_names[today.weekday()],
                    str(today.weekday()),
                    str(today.weekday() + 1),
                }
                if not any(
                    day in valid_days or day[:3] in {
                        day_names[today.weekday()][:3]
                    }
                    for day in selected_days
                ):
                    continue

            medication = reminder.medication
            patient = medication.patient

            if not patient:
                continue

            action_url = f"medication-reminder:{reminder.pk}:{today.isoformat()}:{current_time}"

            if Notification.objects.filter(
                recipient=patient,
                action_url=action_url,
            ).exists():
                continue

            Notification.objects.create(
                recipient=patient,
                category="medication",
                title="Medication reminder",
                message=f"It's time to take {medication.name} ({medication.dosage}).",
                action_url=action_url,
            )
            created += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Medication reminders processed. Notifications created: {created}"
            )
        )
