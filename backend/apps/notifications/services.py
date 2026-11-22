from .models import Notification


def notify_user(recipient, title, message, category="general", action_url=""):
    return Notification.objects.create(
        recipient=recipient,
        title=title,
        message=message,
        category=category,
        action_url=action_url,
    )
