"""
KIRA Health Assistant - Accounts Application Configuration.
"""

from django.apps import AppConfig


class AccountsConfig(AppConfig):
    """
    Configuration for the KIRA accounts application.
    """

    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.accounts"
    label = "accounts"
    verbose_name = "KIRA User Accounts"
