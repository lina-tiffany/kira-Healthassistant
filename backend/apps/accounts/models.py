"""
KIRA Health Assistant - Custom User Model.

Defines the identity, account roles, and profile information
for all KIRA platform users.
"""

import uuid

from django.contrib.auth.models import AbstractUser
from django.db import models


class UserRole(models.TextChoices):
    """
    Available account roles in KIRA.
    """

    PATIENT = "patient", "Patient"
    CAREGIVER = "caregiver", "Caregiver"
    PHARMACY = "pharmacy", "Pharmacy"
    ADMINISTRATOR = "administrator", "Administrator"


class User(AbstractUser):
    """
    Custom user model for the KIRA Health Assistant.
    """

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
    )

    email = models.EmailField(
        unique=True,
        db_index=True,
    )

    phone_number = models.CharField(
        max_length=20,
        blank=True,
        null=True,
    )

    role = models.CharField(
        max_length=20,
        choices=UserRole.choices,
        default=UserRole.PATIENT,
        db_index=True,
    )

    preferred_language = models.CharField(
        max_length=2,
        choices=[
            ("en", "English"),
            ("fr", "French"),
            ("rw", "Kinyarwanda"),
        ],
        default="en",
    )

    profile_picture = models.ImageField(
        upload_to="profiles/",
        blank=True,
        null=True,
    )

    is_email_verified = models.BooleanField(default=False)

    is_phone_verified = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "User"
        verbose_name_plural = "Users"
        ordering = ["-date_joined"]

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"
