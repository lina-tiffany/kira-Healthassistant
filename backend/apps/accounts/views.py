"""
KIRA Health Assistant - Account API Views.

Provides user registration, authentication, and profile management.
"""

from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import (
    UserRegistrationSerializer,
    UserProfileSerializer,
)


class RegisterView(generics.CreateAPIView):
    """
    Register a new KIRA user account.
    """

    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]


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

    Requires the JWT blacklist app to be enabled before use.
    """

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        refresh_token = request.data.get("refresh")

        if not refresh_token:
            return Response(
                {"detail": "A refresh token is required."},
                status=400,
            )

        try:
            token = RefreshToken(refresh_token)
            token.blacklist()

            return Response(
                {"detail": "Successfully logged out."},
                status=200,
            )

        except Exception:
            return Response(
                {"detail": "Invalid or expired refresh token."},
                status=400,
            )
