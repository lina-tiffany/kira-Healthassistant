"""
KIRA Health Assistant - Email Service.

Handles delivery of account verification emails.
"""

from urllib.parse import urlencode

from django.conf import settings
from django.core.mail import send_mail
from django.urls import reverse

from .verification import create_verification_token


def send_verification_email(user, request):
    """
    Send an email containing a secure verification link.

    Returns True when the email is accepted by the email backend.
    """

    token = create_verification_token(user)

    verification_path = reverse("account-verify-email")

    query_string = urlencode({
        "token": token,
    })

    verification_url = request.build_absolute_uri(
        f"{verification_path}?{query_string}"
    )

    recipient_name = user.first_name or user.username

    subject = "Verify your KIRA Health Assistant account"

    message = f"""
Hello {recipient_name},

Thank you for creating an account with KIRA Health Assistant.

Please verify your email address by opening the link below:

{verification_url}

This verification link expires after 24 hours.

If you did not create a KIRA account, you can ignore this email.

KIRA Health Assistant
Supporting your health journey.
"""

    sent_count = send_mail(
        subject=subject,
        message=message.strip(),
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[user.email],
        fail_silently=False,
    )

    return sent_count == 1
