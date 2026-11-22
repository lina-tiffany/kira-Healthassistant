from django.db import transaction
from django.shortcuts import get_object_or_404
from rest_framework import generics, status
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.notifications.services import notify_user
from .models import MedicineOrder
from .serializers import MedicineOrderSerializer


class MedicineOrderListCreateView(generics.ListCreateAPIView):
    serializer_class = MedicineOrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = MedicineOrder.objects.select_related(
            "patient", "pharmacy"
        ).prefetch_related("items__medicine")

        if getattr(user, "role", "") == "administrator":
            return queryset
        if getattr(user, "role", "") == "pharmacy":
            return queryset.filter(pharmacy__owner=user)
        return queryset.filter(patient=user)

    def perform_create(self, serializer):
        if getattr(self.request.user, "role", "") != "patient":
            raise PermissionDenied("Only patient accounts can place orders.")
        serializer.save(patient=self.request.user)


class MedicineOrderDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_order(self, request, pk):
        order = get_object_or_404(
            MedicineOrder.objects.select_related(
                "patient", "pharmacy"
            ).prefetch_related("items__medicine"),
            pk=pk,
        )

        user = request.user
        is_patient = order.patient_id == user.pk
        is_pharmacy = order.pharmacy.owner_id == user.pk
        is_admin = getattr(user, "role", "") == "administrator"

        if not (is_patient or is_pharmacy or is_admin):
            raise PermissionDenied("You cannot access this order.")

        return order, is_patient, is_pharmacy, is_admin

    def get(self, request, pk):
        order, *_ = self.get_order(request, pk)
        return Response(MedicineOrderSerializer(order).data)

    @transaction.atomic
    def patch(self, request, pk):
        order, is_patient, is_pharmacy, is_admin = self.get_order(request, pk)

        new_status = request.data.get("status")

        if is_patient:
            if new_status != "cancelled" or order.status != "pending":
                raise PermissionDenied(
                    "Patients can only cancel pending orders."
                )
        elif not (is_pharmacy or is_admin):
            raise PermissionDenied("You cannot update this order.")

        allowed_transitions = {
            "pending": ["accepted", "rejected", "cancelled"],
            "accepted": ["preparing", "cancelled"],
            "preparing": ["ready", "out_for_delivery"],
            "ready": ["completed"],
            "out_for_delivery": ["completed"],
        }

        if new_status not in allowed_transitions.get(order.status, []):
            raise ValidationError({
                "status": f"Cannot change order from {order.status} to {new_status}."
            })

        if new_status == "accepted":
            for item in order.items.select_related("medicine").all():
                medicine = item.medicine.__class__.objects.select_for_update().get(
                    pk=item.medicine_id
                )
                if medicine.quantity < item.quantity:
                    raise ValidationError(
                        f"Insufficient stock for {medicine.medicine_name}."
                    )
                medicine.quantity -= item.quantity
                medicine.save(update_fields=["quantity", "is_available", "updated_at"])

        order.status = new_status
        order.save(update_fields=["status", "updated_at"])

        notify_user(
            recipient=order.patient,
            title="Medicine order update",
            message=f"Your medicine order #{order.pk} is now {order.get_status_display()}.",
            category="health",
            action_url=f"medicine-order:{order.pk}",
        )

        return Response(MedicineOrderSerializer(order).data)
