from django.urls import path
from .views import (
    SymptomListCreateView,
    SymptomDetailView,
    SymptomAnalyticsView,
)

urlpatterns = [
    path("", SymptomListCreateView.as_view(), name="symptom-list"),
    path("analytics/", SymptomAnalyticsView.as_view(), name="symptom-analytics"),
    path("<int:pk>/", SymptomDetailView.as_view(), name="symptom-detail"),
]
