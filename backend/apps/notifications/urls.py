from django.urls import path
from .views import (
    NotificationListView,
    NotificationDeleteView,
    UnreadNotificationCountView,
    MarkNotificationReadView,
    MarkAllNotificationsReadView,
)

urlpatterns = [
    path("", NotificationListView.as_view(), name="notification-list"),
    path("unread-count/", UnreadNotificationCountView.as_view(), name="unread-count"),
    path("read-all/", MarkAllNotificationsReadView.as_view(), name="read-all"),
    path("<int:pk>/read/", MarkNotificationReadView.as_view(), name="notification-read"),
    path("<int:pk>/", NotificationDeleteView.as_view(), name="notification-delete"),
]
