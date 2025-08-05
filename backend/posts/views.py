import random
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import render
from rest_framework.permissions import AllowAny
from .models import Post
from .serialisers import PostSerializer
from rest_framework import viewsets

class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    permission_classes = [AllowAny]

    @action(detail=False, methods=['get'])
    def random(self, request):
        count = Post.objects.count()
        if count == 0:
            return Response({'error':'Нет поста'}, status=400)
        random_index = random.randint(0, count - 1)
        post = Post.objects.all()[random_index]
        serializer = PostSerializer(post, context={'request':request})
        return Response(serializer.data)
