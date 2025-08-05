from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Rating

@receiver(post_save, sender=Rating)
def update_post_rating(sender, instance, **kwargs):
    instance.post.update_average_rating()