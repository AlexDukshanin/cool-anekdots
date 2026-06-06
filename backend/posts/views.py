from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from .models import Post
from .serialisers import PostSerializer
import random

class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.all()
    serializer_class = PostSerializer

    def get_permissions(self):
        if self.action in ("list", "retrieve", "random"):
            return [AllowAny()]
        return [IsAuthenticated()]

    # Вывод страницы с постами
    # Если пользователь авторизован и его is_staf == true, тогда он видет все посты
    # Если нет то видет все, кроме постов в с тегом "on_modeated"
    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated and user.is_staff:
            return Post.objects.all()
        return Post.objects.exclude(tags__name__iexact="on_moderated")

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)
    # Фнкция которая берет рандомный пост по id, эим посты рендерятся на страницу рандомного анекдота 
    @action(detail=False, methods=['get'])
    def random(self, request):
        posts = self.get_queryset()
        count = posts.count()

        if count == 0:
            return Response({'error': 'Нет поста'}, status=400)

        random_index = random.randint(0, count - 1)
        post = posts[random_index]
        serializer = PostSerializer(post, context={'request': request})
        return Response(serializer.data)
    

    @action(detail=False, methods=['get'])
    def on_moderated(self, request):
        # Только модератор может видеть посты на модерации
        if not request.user.is_authenticated or not request.user.is_staff:
            return Response({'error': 'Нет прав доступа'}, status=status.HTTP_403_FORBIDDEN)

        posts = Post.objects.filter(tags__name__iexact="on_moderated")
        serializer = PostSerializer(posts, many=True, context={'request': request})
        return Response(serializer.data)

    # Ограничим удаление только для модераторов
    def destroy(self, request, *args, **kwargs):
        if not request.user.is_authenticated or not request.user.is_staff:
            return Response({'error': 'Нет прав на удаление'}, status=403)
        return super().destroy(request, *args, **kwargs)

    # Ограничим редактирование только для модераторов
    def update(self, request, *args, **kwargs):
        if not request.user.is_authenticated or not request.user.is_staff:
            return Response({'error': 'Нет прав на редактирование'}, status=403)

        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)

    # Отдельный action для публикации поста (убираем только тег on_moderated)
    @action(detail=True, methods=['post'])
    def publish(self, request, pk=None):
        if not request.user.is_authenticated or not request.user.is_staff:
            return Response({'error': 'Нет прав на публикацию'}, status=403)

        post = self.get_object()
        post.tags.remove(*post.tags.filter(name__iexact="on_moderated"))
        post.save()
        serializer = PostSerializer(post, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)
