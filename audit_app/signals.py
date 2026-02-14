# Signals are currently disabled as User model is self-contained.
# from django.db.models.signals import post_save
# from django.dispatch import receiver
# from django.contrib.auth import get_user_model
# from .models import User

# User = get_user_model()

# @receiver(post_save, sender=User)
# def some_handler(sender, instance, created, **kwargs):
#     pass
