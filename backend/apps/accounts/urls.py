"""
KIRA Health Assistant - Account URL Routes.
"""

from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .authentication import EmailTokenObtainPairView
from .views import (
    RegisterView,
    UserProfileView,
    LogoutView,
)
from .admin_views import (
    AdminUserListView,
    AdminUserDetailView,
)
from .email_views import (
    SendVerificationEmailView,
    VerifyEmailView,
)

urlpatterns = [
    # Public registration and authentication
    path(
        "register/",
        RegisterView.as_view(),
        name="account-register",
    ),
    path(
        "login/",
        EmailTokenObtainPairView.as_view(),
        name="account-login",
    ),
    path(
        "token/refresh/",
        TokenRefreshView.as_view(),
        name="token-refresh",
    ),

    # Authenticated user profile
    path(
        "profile/",
        UserProfileView.as_view(),
        name="account-profile",
    ),
    path(
        "logout/",
        LogoutView.as_view(),
        name="account-logout",
    ),

    # Administrator user management
    path(
        "admin/users/",
        AdminUserListView.as_view(),
        name="admin-user-list",
    ),
    path(
        "admin/users/<uuid:id>/",
        AdminUserDetailView.as_view(),
        name="admin-user-detail",
    ),

        # Email verification
    path(
        "email/send-verification/",
        SendVerificationEmailView.as_view(),
        name="account-send-verification",
    ),
    path(
        "email/verify/",
        VerifyEmailView.as_view(),
        name="account-verify-email",
    ),
]
