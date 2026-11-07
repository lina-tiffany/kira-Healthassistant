"""
KIRA Health Assistant - Administrator API Views.

Allows authorized administrators to manage user accounts.
"""

from django.contrib.auth import get_user_model
from rest_framework import generics, permissions

from .admin_serializers import AdminUserSerializer
from .permissions import IsAdministrator


User = get_user_model()


class AdminUserListView(generics.ListAPIView):
    """List all KIRA user accounts."""

    queryset = User.objects.all().order_by("-date_joined")
    serializer_class = AdminUserSerializer
    permission_classes = [
        permissions.IsAuthenticated,
        IsAdministrator,
    ]


class AdminUserDetailView(generics.RetrieveUpdateAPIView):
    """View and update an individual user account."""

    queryset = User.objects.all()
    serializer_class = AdminUserSerializer
    permission_classes = [
        permissions.IsAuthenticated,
        IsAdministrator,
    ]
    lookup_field = "id"
