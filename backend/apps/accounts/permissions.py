"""
KIRA Health Assistant - Role-Based Permissions.

Controls access to API features based on account roles.
"""

from rest_framework.permissions import BasePermission


class IsPatient(BasePermission):
    """Allow access to patient accounts only."""

    message = "This feature is available to patients only."

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == "patient"
        )


class IsCaregiver(BasePermission):
    """Allow access to caregiver accounts only."""

    message = "This feature is available to caregivers only."

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == "caregiver"
        )


class IsPharmacy(BasePermission):
    """Allow access to pharmacy accounts only."""

    message = "This feature is available to pharmacy accounts only."

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == "pharmacy"
        )


class IsAdministrator(BasePermission):
    """Allow access to administrator accounts only."""

    message = "Administrator privileges are required."

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == "administrator"
        )


class IsCaregiverOrAdministrator(BasePermission):
    """Allow caregivers and administrators."""

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role in ["caregiver", "administrator"]
        )


class IsPharmacyOrAdministrator(BasePermission):
    """Allow pharmacy accounts and administrators."""

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role in ["pharmacy", "administrator"]
        )
