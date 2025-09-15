from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.db.models import Avg
from django.conf import settings
from taggit.managers import TaggableManager

User = get_user_model()

class Post(models.Model):
    title =  models.CharField(max_length=255)
    tags = TaggableManager()
    content = models.TextField()
    created_at = models.DateTimeField(default=timezone.now)
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE,related_name='posts' )
    average_rating = models.FloatField(default=0.0)

    def save(self, *args, **kwargs):
        is_new = self.pk is None
        super().save(*args, **kwargs)
        if is_new:  # Если пост только что создан
            self.tags.add("on_moderated")

    def __str__(self):
        return self.title
    
    class Meta:
        verbose_name = "Анекдот"
        verbose_name_plural = "Анекдоты"

    def update_average_rating(self):
        ratings_qs = self.ratings.all()
        avg = ratings_qs.aggregate(avg_score=Avg('score'))['avg_score'] or 0
        self.average_rating = round(avg, 2)
        self.save()

    
