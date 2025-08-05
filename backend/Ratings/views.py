from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .models import Rating
from .serializers import RatingSerializer, PostSerializer
from posts.models import Post

class RatingCreateAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        data = request.data.copy()
        data['user'] = request.user.id

        # Проверка: не поставил ли уже пользователь оценку
        rating, created = Rating.objects.update_or_create(
            user=request.user,
            post_id=data['post'],
            defaults={'score': data['score']}
        )

        rating.save()  # пересчёт произойдёт через сигнал

        # Получаем обновлённый пост
        post = Post.objects.get(id=data['post'])
        post_serializer = PostSerializer(post)

        return Response(post_serializer.data, status=status.HTTP_200_OK)


