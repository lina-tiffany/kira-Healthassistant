from django.db.models import Count, Q
from django.shortcuts import get_object_or_404
from django.utils import timezone

from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Appointment
from .serializers import AppointmentSerializer


class AppointmentListCreateView(generics.ListCreateAPIView):
    serializer_class = AppointmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Appointment.objects.filter(
            patient__user=self.request.user
        )

        period = self.request.query_params.get("period")
        today = timezone.localdate()

        if period == "upcoming":
            queryset = queryset.filter(
                appointment_date__gte=today
            ).exclude(status__in=["cancelled", "completed"])
        elif period == "past":
            queryset = queryset.filter(appointment_date__lt=today)

        appointment_status = self.request.query_params.get("status")
        if appointment_status:
            queryset = queryset.filter(status=appointment_status)

        return queryset

    def perform_create(self, serializer):
        serializer.save(patient=self.request.user.patient_profile)


class AppointmentDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = AppointmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Appointment.objects.filter(
            patient__user=self.request.user
        )


class AppointmentSummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        appointments = Appointment.objects.filter(
            patient__user=request.user
        )

        today = timezone.localdate()

        summary = appointments.aggregate(
            total=Count("id"),
            scheduled=Count("id", filter=Q(status="scheduled")),
            confirmed=Count("id", filter=Q(status="confirmed")),
            completed=Count("id", filter=Q(status="completed")),
            cancelled=Count("id", filter=Q(status="cancelled")),
        )

        summary["upcoming"] = appointments.filter(
            appointment_date__gte=today,
            appointment_date__lte=today + timezone.timedelta(days=30),
        ).exclude(status__in=["cancelled", "completed"]).count()

        return Response(summary)


class AppointmentCancelView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        appointment = get_object_or_404(
            Appointment,
            pk=pk,
            patient__user=request.user,
        )

        if appointment.status in ["completed", "cancelled"]:
            return Response(
                {"detail": "This appointment cannot be cancelled."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        appointment.status = "cancelled"
        appointment.save(update_fields=["status", "updated_at"])

        return Response(
            AppointmentSerializer(appointment).data,
            status=status.HTTP_200_OK,
        )
