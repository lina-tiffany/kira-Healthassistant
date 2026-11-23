# KIRA Notification Scheduling

KIRA processes medication and appointment reminders through:

    python manage.py run_notification_reminders

## Linux production server

Run the following command to edit the deployment user's cron schedule:

    crontab -e

Add this entry, replacing /absolute/path/to/backend with the
actual absolute path to KIRA's backend directory:

    * * * * * /absolute/path/to/backend/run_notifications.sh >> /absolute/path/to/backend/notifications.log 2>&1

This runs the reminder processor once every minute.

The server must remain running, and its timezone must be configured
correctly for the patients' appointment and medication schedules.

## Important

- The medication command creates in-app notifications.
- The appointment command creates in-app notifications.
- The notification API makes these available in the KIRA application.
- Email and SMS delivery require separate provider integration.
- Codespaces is a development environment, not a reliable production scheduler.
