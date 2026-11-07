"""
KIRA Health Assistant - Account Serializers.

Handles user registration, profile information,
and secure password validation.
"""

from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers


User = get_user_model()


class UserRegistrationSerializer(serializers.ModelSerializer):
    """
    Validates and creates new KIRA user accounts.
    """

    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password],
        style={"input_type": "password"},
    )

    password_confirmation = serializers.CharField(
        write_only=True,
        required=True,
        style={"input_type": "password"},
    )

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "password",
            "password_confirmation",
            "first_name",
            "last_name",
            "phone_number",
            "role",
            "preferred_language",
        ]
        read_only_fields = ["id"]

    def validate_email(self, value):
        email = value.strip().lower()

        if User.objects.filter(email__iexact=email).exists():
            raise serializers.ValidationError(
                "An account with this email already exists."
            )

        return email

    def validate(self, attrs):
        if attrs["password"] != attrs["password_confirmation"]:
            raise serializers.ValidationError({
                "password_confirmation": "Passwords do not match."
            })

        return attrs

    def create(self, validated_data):
        validated_data.pop("password_confirmation")

        password = validated_data.pop("password")

        user = User(**validated_data)
        user.set_password(password)
        user.save()

        return user


class UserProfileSerializer(serializers.ModelSerializer):
    """
    Returns and updates the authenticated user's profile.
    """

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "phone_number",
            "role",
            "preferred_language",
            "profile_picture",
            "is_email_verified",
            "is_phone_verified",
            "date_joined",
            "created_at",
        ]

        read_only_fields = [
            "id",
            "username",
            "role",
            "is_email_verified",
            "is_phone_verified",
            "date_joined",
            "created_at",
        ]
