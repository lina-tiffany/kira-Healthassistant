"""
KIRA Health Assistant - Administrator Serializers.

Provides controlled user information and account management.
"""

from django.contrib.auth import get_user_model
from rest_framework import serializers


User = get_user_model()


class AdminUserSerializer(serializers.ModelSerializer):
    """Displays account information to administrators."""

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
            "is_active",
            "is_email_verified",
            "is_phone_verified",
            "is_staff",
            "is_superuser",
            "date_joined",
            "created_at",
        ]

        read_only_fields = [
            "id",
            "date_joined",
            "created_at",
        ]
