from django.urls import path

from .views import (
    AppointmentListCreateView,
    AppointmentDetailView,
    AppointmentSummaryView,
    AppointmentCancelView,
)

urlpatterns = [
    path("", AppointmentListCreateView.as_view(), name="appointment-list"),
    path("summary/", AppointmentSummaryView.as_view(), name="appointment-summary"),
    path("<int:pk>/cancel/", AppointmentCancelView.as_view(), name="appointment-cancel"),
    path("<int:pk>/", AppointmentDetailView.as_view(), name="appointment-detail"),
]
