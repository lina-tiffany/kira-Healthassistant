from django.urls import path
from .views import (
    MedicationListCreateView,
    MedicationDetailView,
    MedicationReminderListCreateView,
    MedicationLogListCreateView,
)

urlpatterns = [
    path("", MedicationListCreateView.as_view(), name="medication-list"),
    path("<int:pk>/", MedicationDetailView.as_view(), name="medication-detail"),
    path("reminders/", MedicationReminderListCreateView.as_view(), name="medication-reminders"),
    path("logs/", MedicationLogListCreateView.as_view(), name="medication-logs"),
]
