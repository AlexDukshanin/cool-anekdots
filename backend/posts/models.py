from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.db.models import Avg
from django.conf import settings


User = get_user_model()

class Post(models.Model):
    title =  models.CharField(max_length=255)
    tags = models.CharField(max_length=255)
    content = models.TextField()
    created_at = models.DateTimeField(default=timezone.now)
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE,related_name='posts' )
    average_rating = models.FloatField(default=0.0)

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
