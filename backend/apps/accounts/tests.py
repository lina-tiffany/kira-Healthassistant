"""
KIRA Health Assistant - Account Tests.

Tests registration, email verification, authentication,
and account security.
"""

from django.contrib.auth import get_user_model
from django.core import mail
from django.test import override_settings
from django.urls import reverse

from rest_framework.test import APITestCase

from .verification import create_verification_token


User = get_user_model()


@override_settings(
    EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend"
)
class AccountRegistrationTests(APITestCase):
    """Tests patient registration and account security."""

    def test_registration_creates_patient_account(self):
        response = self.client.post(
            reverse("account-register"),
            {
                "username": "patient_one",
                "email": "patient@example.com",
                "password": "VeryStrongPassword!2026",
                "password_confirmation": "VeryStrongPassword!2026",
                "first_name": "Test",
                "last_name": "Patient",
                "role": "administrator",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 201)

        user = User.objects.get(email="patient@example.com")

        self.assertEqual(user.role, "patient")
        self.assertFalse(user.is_email_verified)
        self.assertTrue(user.check_password("VeryStrongPassword!2026"))

    def test_registration_sends_verification_email(self):
        self.client.post(
            reverse("account-register"),
            {
                "username": "patient_two",
                "email": "patient2@example.com",
                "password": "VeryStrongPassword!2026",
                "password_confirmation": "VeryStrongPassword!2026",
            },
            format="json",
        )

        self.assertEqual(len(mail.outbox), 1)
        self.assertIn(
            "Verify your KIRA",
            mail.outbox[0].subject,
        )


class AccountVerificationTests(APITestCase):
    """Tests email verification."""

    def setUp(self):
        self.user = User.objects.create_user(
            username="verification_patient",
            email="verification@example.com",
            password="VeryStrongPassword!2026",
            role="patient",
        )

    def test_valid_token_verifies_email(self):
        token = create_verification_token(self.user)

        response = self.client.get(
            reverse("account-verify-email"),
            {"token": token},
        )

        self.assertEqual(response.status_code, 200)

        self.user.refresh_from_db()

        self.assertTrue(self.user.is_email_verified)

    def test_invalid_token_does_not_verify_email(self):
        response = self.client.get(
            reverse("account-verify-email"),
            {"token": "invalid-token"},
        )

        self.assertEqual(response.status_code, 400)

        self.user.refresh_from_db()

        self.assertFalse(self.user.is_email_verified)


class AccountAuthenticationTests(APITestCase):
    """Tests email-based login and verification requirements."""

    def setUp(self):
        self.user = User.objects.create_user(
            username="login_patient",
            email="login@example.com",
            password="VeryStrongPassword!2026",
            role="patient",
        )

    def test_unverified_user_cannot_login(self):
        response = self.client.post(
            reverse("account-login"),
            {
                "email": "login@example.com",
                "password": "VeryStrongPassword!2026",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 400)

        self.assertIn(
            "verify your email",
            str(response.data).lower(),
        )

    def test_verified_user_can_login_with_email(self):
        self.user.is_email_verified = True
        self.user.save(update_fields=["is_email_verified"])

        response = self.client.post(
            reverse("account-login"),
            {
                "email": "login@example.com",
                "password": "VeryStrongPassword!2026",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)
