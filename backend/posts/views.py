import random

from django.db.models import Q
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from .models import Post
from .serialisers import PostSerializer

MODERATION_TAGS = ("on_moderated", "on_moderation")


class OptionalPostPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    pagination_class = OptionalPostPagination

    def get_permissions(self):
        if self.action in ("list", "retrieve", "random"):
            return [AllowAny()]
        return [IsAuthenticated()]

    # Вывод страницы с постами
    # Если пользователь авторизован и его is_staf == true, тогда он видет все посты
    # Если нет то видет все, кроме постов в с тегом "on_modeated"
    def get_queryset(self):
        user = self.request.user
        queryset = Post.objects.select_related('author').prefetch_related('tags')

        if user.is_authenticated and user.is_staff:
            filtered = queryset
        else:
            filtered = queryset.exclude(
                Q(tags__name__iexact=MODERATION_TAGS[0]) |
                Q(tags__name__iexact=MODERATION_TAGS[1])
            )

        search = (self.request.query_params.get('search') or self.request.query_params.get('q') or '').strip()
        if search:
            filtered = filtered.filter(
                Q(title__icontains=search) |
                Q(content__icontains=search) |
                Q(author__name__icontains=search) |
                Q(tags__name__icontains=search)
            ).distinct()

        tags = self._get_requested_tags()
        if tags:
            filtered = filtered.filter(tags__name__in=tags).distinct()

        ordering = self._get_ordering()
        if ordering:
            filtered = filtered.order_by(ordering)
        elif self._should_paginate():
            filtered = filtered.order_by('-created_at', '-id')

        return filtered

    def _get_requested_tags(self):
        raw_values = []
        raw_values.extend(self.request.query_params.getlist('tag'))
        raw_values.extend(self.request.query_params.getlist('tags'))

        tags = []
        for value in raw_values:
            tags.extend(part.strip() for part in value.split(',') if part.strip())
        return tags

    def _get_ordering(self):
        sort = (self.request.query_params.get('sort') or '').strip().lower()
        ordering = (self.request.query_params.get('ordering') or '').strip()

        sort_map = {
            'newest': '-created_at',
            'oldest': 'created_at',
            'best': '-average_rating',
            'worst': 'average_rating',
        }
        allowed_ordering = {'created_at', '-created_at', 'average_rating', '-average_rating', 'title', '-title'}
        if sort in sort_map:
            return sort_map[sort]
        if ordering in allowed_ordering:
            return ordering
        return None

    def _should_paginate(self):
        return 'page' in self.request.query_params or 'page_size' in self.request.query_params

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())

        if self._should_paginate():
            page = self.paginate_queryset(queryset)
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

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

        posts = Post.objects.filter(
            Q(tags__name__iexact=MODERATION_TAGS[0]) |
            Q(tags__name__iexact=MODERATION_TAGS[1])
        ).distinct()
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
        post.tags.remove(*post.tags.filter(
            Q(name__iexact=MODERATION_TAGS[0]) |
            Q(name__iexact=MODERATION_TAGS[1])
        ))
        post.save()
        serializer = PostSerializer(post, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)
