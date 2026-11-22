from django.urls import path
from .views import MedicineOrderListCreateView, MedicineOrderDetailView

urlpatterns = [
    path("", MedicineOrderListCreateView.as_view(), name="medicine-orders"),
    path("<int:pk>/", MedicineOrderDetailView.as_view(), name="medicine-order-detail"),
]
