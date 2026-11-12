from django.urls import path
from .views import SymptomListCreateView, SymptomDetailView

urlpatterns = [
    path("", SymptomListCreateView.as_view(), name="symptom-list"),
    path("<int:pk>/", SymptomDetailView.as_view(), name="symptom-detail"),
]
