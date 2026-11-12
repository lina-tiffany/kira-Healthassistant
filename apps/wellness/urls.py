from django.urls import path
from .views import WellnessListCreateView, WellnessDetailView

urlpatterns = [
    path("", WellnessListCreateView.as_view(), name="wellness-list"),
    path("<int:pk>/", WellnessDetailView.as_view(), name="wellness-detail"),
]
