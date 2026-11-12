from rest_framework.permissions import BasePermission


class HealthRecordPermission(BasePermission):

    def has_object_permission(self, request, view, obj):
        user = request.user

        if obj.patient.user_id == user.id:
            return True

        if request.method not in ["GET", "HEAD", "OPTIONS"]:
            return False

        return obj.patient.caregiver_relationships.filter(
            caregiver=user,
            status="approved",
            can_view_medical_history=True
        ).exists()
