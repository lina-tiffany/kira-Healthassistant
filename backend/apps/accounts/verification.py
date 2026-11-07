"""
KIRA Health Assistant - Email Verification Service.

Creates and validates secure, time-limited email verification tokens.
"""

from django.contrib.auth import get_user_model
from django.core import signing


User = get_user_model()

VERIFICATION_SALT = "kira.email-verification"
VERIFICATION_TOKEN_MAX_AGE = 60 * 60 * 24  # 24 hours


def create_verification_token(user):
    """
    Create a signed verification token for a user.
    """

    return signing.dumps(
        {"user_id": str(user.pk)},
        salt=VERIFICATION_SALT,
    )


def verify_email_token(token):
    """
    Validate a token and mark the associated email as verified.

    Returns the verified user, or None if the token is invalid,
    expired, or belongs to an unknown account.
    """

    try:
        data = signing.loads(
            token,
            salt=VERIFICATION_SALT,
            max_age=VERIFICATION_TOKEN_MAX_AGE,
        )

        user = User.objects.get(pk=data["user_id"])

    except (
        signing.BadSignature,
        signing.SignatureExpired,
        User.DoesNotExist,
        KeyError,
        TypeError,
    ):
        return None

    if not user.is_email_verified:
        user.is_email_verified = True
        user.save(update_fields=["is_email_verified"])

    return user
