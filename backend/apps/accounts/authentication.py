"""
KIRA Health Assistant - Email Authentication.

Allows users to authenticate using their email address
and password instead of their username.
"""

from django.contrib.auth import authenticate, get_user_model
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer


User = get_user_model()


class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Generates JWT tokens using email and password.
    """

    email = serializers.EmailField(write_only=True)

    def validate(self, attrs):
        email = attrs.get("email", "").strip().lower()
        password = attrs.get("password")

        try:
            user = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            raise serializers.ValidationError(
                {"detail": "Invalid email or password."}
            )

        authenticated_user = authenticate(
            request=self.context.get("request"),
            username=user.username,
            password=password,
        )

        if authenticated_user is None:
            raise serializers.ValidationError(
                {"detail": "Invalid email or password."}
            )

        if not authenticated_user.is_active:
            raise serializers.ValidationError(
                {"detail": "This account is inactive."}
            )

        refresh = self.get_token(authenticated_user)

        return {
            "refresh": str(refresh),
            "access": str(refresh.access_token),
        }
