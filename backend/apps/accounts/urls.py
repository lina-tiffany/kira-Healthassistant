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


urlpatterns = [
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
]
