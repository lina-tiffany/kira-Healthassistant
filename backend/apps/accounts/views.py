"""
KIRA Health Assistant - Account API Views.

Provides registration, authentication, and profile management.
"""

import logging

from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .email_service import send_verification_email
from .serializers import (
    UserRegistrationSerializer,
    UserProfileSerializer,
)


logger = logging.getLogger(__name__)


class RegisterView(generics.CreateAPIView):
    """
    Register a patient account and send an email verification link.
    """

    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.save()

        verification_email_sent = False

        try:
            verification_email_sent = send_verification_email(
                user,
                request,
            )
        except Exception:
            logger.exception(
                "Verification email could not be sent for user %s.",
                user.pk,
            )

        if verification_email_sent:
            detail = (
                "Your account was created successfully. "
                "Please check your email to verify your account."
            )
        else:
            detail = (
                "Your account was created successfully, but the "
                "verification email could not be sent. "
                "You can request another verification email."
            )

        return Response(
            {
                "detail": detail,
                "verification_email_sent": verification_email_sent,
            },
            status=status.HTTP_201_CREATED,
        )


class UserProfileView(generics.RetrieveUpdateAPIView):
    """
    Retrieve or update the authenticated user's profile.
    """

    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class LogoutView(APIView):
    """
    Log out by invalidating the supplied refresh token.
    """

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        refresh_token = request.data.get("refresh")

        if not refresh_token:
            return Response(
                {"detail": "A refresh token is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            token = RefreshToken(refresh_token)
            token.blacklist()

            return Response(
                {"detail": "Successfully logged out."},
                status=status.HTTP_200_OK,
            )

        except Exception:
            return Response(
                {"detail": "Invalid or expired refresh token."},
                status=status.HTTP_400_BAD_REQUEST,
            )
