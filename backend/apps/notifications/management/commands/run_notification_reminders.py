from django.core.management import call_command
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Process all scheduled KIRA notification reminders."

    def handle(self, *args, **options):
        self.stdout.write("Processing medication reminders...")
        call_command("send_due_reminders")

        self.stdout.write("Processing appointment reminders...")
        call_command("send_appointment_reminders")

        self.stdout.write(
            self.style.SUCCESS("KIRA notification processing completed.")
        )
