"""
KIRA Health Assistant - Account URL Routes.
"""

from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

from .views import (
    RegisterView,
    UserProfileView,
    LogoutView,
)


urlpatterns = [
    # Account registration
    path(
        "register/",
        RegisterView.as_view(),
        name="account-register",
    ),

    # JWT authentication
    path(
        "login/",
        TokenObtainPairView.as_view(),
        name="account-login",
    ),

    path(
        "token/refresh/",
        TokenRefreshView.as_view(),
        name="token-refresh",
    ),

    # User profile
    path(
        "profile/",
        UserProfileView.as_view(),
        name="account-profile",
    ),

    # Logout
    path(
        "logout/",
        LogoutView.as_view(),
        name="account-logout",
    ),
]
