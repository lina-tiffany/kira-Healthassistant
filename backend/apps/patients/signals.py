from django.contrib.auth import get_user_model
from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import PatientProfile


User = get_user_model()


@receiver(post_save, sender=User)
def create_patient_profile(sender, instance, created, **kwargs):
    if created and instance.role == "patient":
        PatientProfile.objects.get_or_create(user=instance)
