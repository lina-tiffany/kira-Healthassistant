"""
KIRA Health Assistant - URL Configuration.
"""

from django.contrib import admin
from django.http import JsonResponse
from django.urls import include, path
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularSwaggerView,
)


def api_root(request):
    """
    Welcome endpoint for the KIRA Health Assistant API.
    """
    return JsonResponse({
        "application": "KIRA Health Assistant",
        "version": "1.0.0",
        "status": "operational",
        "message": "Welcome to the KIRA Health Assistant API.",
        "documentation": "/api/docs/",
        "schema": "/api/schema/",
        "modules": [
            "accounts",
            "patients",
            "caregivers",
            "medications",
            "symptoms",
            "health_records",
            "wellness",
            "appointments",
            "pharmacy",
            "notifications",
            "analytics",
        ],
    })

urlpatterns = [
    # API welcome endpoint
    path("", api_root, name="api-root"),

    # Django administration
    path("admin/", admin.site.urls),

    # KIRA account endpoints
    path("api/accounts/", include("apps.accounts.urls")),

    # OpenAPI schema
    path(
        "api/schema/",
        SpectacularAPIView.as_view(),
        name="api-schema",
    ),

    # Interactive Swagger documentation
    path(
        "api/docs/",
        SpectacularSwaggerView.as_view(
            url_name="api-schema"
        ),
        name="api-docs",
    ),
]
