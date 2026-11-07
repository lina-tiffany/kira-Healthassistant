"""
KIRA Health Assistant - Email Verification API.

Handles sending, resending, and confirming verification links.
"""

import logging

from rest_framework import permissions, status
from rest_framework.exceptions import Throttled
from rest_framework.response import Response
from rest_framework.throttling import SimpleRateThrottle
from rest_framework.views import APIView

from .email_service import send_verification_email
from .verification import verify_email_token


logger = logging.getLogger(__name__)


class VerificationEmailRateThrottle(SimpleRateThrottle):
    """
    Limit verification email requests to five per user per hour.
    """

    scope = "verification_email"
    rate = "5/hour"

    def get_cache_key(self, request, view):
        if not request.user.is_authenticated:
            return None

        return self.cache_format % {
            "scope": self.scope,
            "ident": request.user.pk,
        }


class SendVerificationEmailView(APIView):
    """
    Send a verification link to the authenticated user.
    """

    permission_classes = [permissions.IsAuthenticated]
    throttle_classes = [VerificationEmailRateThrottle]

    def post(self, request):
        user = request.user

        if user.is_email_verified:
            return Response(
                {"detail": "Your email address is already verified."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            sent = send_verification_email(user, request)

            if not sent:
                return Response(
                    {"detail": "Unable to send verification email."},
                    status=status.HTTP_503_SERVICE_UNAVAILABLE,
                )

        except Exception:
            logger.exception(
                "Failed to send verification email for user %s.",
                user.pk,
            )

            return Response(
                {"detail": "Email delivery is temporarily unavailable."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        return Response(
            {"detail": "Verification email sent successfully."},
            status=status.HTTP_200_OK,
        )


class VerifyEmailView(APIView):
    """
    Verify an email address using a signed verification token.
    """

    permission_classes = [permissions.AllowAny]

    def get(self, request):
        token = request.query_params.get("token")

        if not token:
            return Response(
                {"detail": "A verification token is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = verify_email_token(token)

        if user is None:
            return Response(
                {
                    "detail": (
                        "The verification link is invalid or has expired."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            {
                "detail": (
                    "Your email address has been verified successfully."
                )
            },
            status=status.HTTP_200_OK,
        )
