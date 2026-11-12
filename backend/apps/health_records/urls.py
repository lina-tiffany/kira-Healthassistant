from django.urls import path
from .views import (
    HealthRecordListCreateView,
    HealthRecordDetailView,
)

urlpatterns = [
    path("", HealthRecordListCreateView.as_view(), name="health-record-list"),
    path("<int:pk>/", HealthRecordDetailView.as_view(), name="health-record-detail"),
]
