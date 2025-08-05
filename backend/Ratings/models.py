from django.db import models
from django.contrib.auth import get_user_model
from posts.models import Post
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db.models import Avg

User = get_user_model()

class Rating(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='ratings')
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='ratings')
    score = models.PositiveSmallIntegerField(default=0, validators=[MaxValueValidator(5),MinValueValidator(1)])
    rated_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user','post')
        verbose_name = "Оценка"
        verbose_name_plural = "Оценки"

    def __str__(self):
        return f"{self.user.email} rated {self.post.title} as {self.score}"
    
    def save(self, *args, **kwargs):
        super().save(*args,**kwargs)
        ratings = Rating.objects.filter(post = self.post)
        avg = ratings.aggregate(avg_score=Avg('score'))['avg_score'] or 0
        self.post.avarage_rating = round(avg, 2)
        self.post.save()
