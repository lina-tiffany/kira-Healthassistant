from django.urls import path
from .views import (
    CaregiverRelationshipListCreateView,
    CaregiverRequestResponseView,
    CaregiverPermissionsView,
    CaregiverRelationshipRevokeView,
)

urlpatterns = [
    path("", CaregiverRelationshipListCreateView.as_view(), name="caregiver-relationships"),
    path("<int:pk>/respond/", CaregiverRequestResponseView.as_view(), name="caregiver-respond"),
    path("<int:pk>/permissions/", CaregiverPermissionsView.as_view(), name="caregiver-permissions"),
    path("<int:pk>/revoke/", CaregiverRelationshipRevokeView.as_view(), name="caregiver-revoke"),
]
