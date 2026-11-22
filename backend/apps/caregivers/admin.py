from django.contrib import admin
from .models import CaregiverRelationship


@admin.register(CaregiverRelationship)
class CaregiverRelationshipAdmin(admin.ModelAdmin):
    list_display = (
        "patient", "caregiver", "status",
        "can_view_medical_history", "created_at",
    )
    list_filter = ("status",)
    search_fields = ("patient__email", "caregiver__email")
