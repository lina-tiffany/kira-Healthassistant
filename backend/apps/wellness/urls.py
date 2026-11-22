from django.urls import path

from .views import (
    WellnessListCreateView,
    WellnessDetailView,
    WellnessSummaryView,
)

urlpatterns = [
    path("", WellnessListCreateView.as_view(), name="wellness-list"),
    path("summary/", WellnessSummaryView.as_view(), name="wellness-summary"),
    path("<int:pk>/", WellnessDetailView.as_view(), name="wellness-detail"),
]
