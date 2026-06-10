from django.db.models import Q

from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response

from .models import CustomUser, UserAccessLog
from .serializers import AdminUserSerializer, UserAccessLogSerializer


class AdminApiPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


class AdminUserViewSet(viewsets.ModelViewSet):
    serializer_class = AdminUserSerializer
    permission_classes = [IsAdminUser]
    pagination_class = AdminApiPagination
    http_method_names = ['get', 'patch', 'delete', 'post', 'head', 'options']

    def get_queryset(self):
        queryset = CustomUser.objects.all().order_by('-created_at')

        search = (self.request.query_params.get('search') or '').strip()
        if search:
            queryset = queryset.filter(
                Q(email__icontains=search) |
                Q(name__icontains=search) |
                Q(registration_ip=search) |
                Q(last_login_ip=search)
            )

        is_active = self.request.query_params.get('is_active')
        if is_active in ('true', 'false', '1', '0'):
            queryset = queryset.filter(is_active=is_active in ('true', '1'))

        is_staff = self.request.query_params.get('is_staff')
        if is_staff in ('true', 'false', '1', '0'):
            queryset = queryset.filter(is_staff=is_staff in ('true', '1'))

        ordering = self.request.query_params.get('ordering')
        allowed_ordering = {
            'created_at',
            '-created_at',
            'last_login_at',
            '-last_login_at',
            'email',
            '-email',
            'name',
            '-name',
        }
        if ordering in allowed_ordering:
            queryset = queryset.order_by(ordering)

        return queryset

    def perform_update(self, serializer):
        if serializer.instance.pk == self.request.user.pk and serializer.validated_data.get('is_active') is False:
            raise ValidationError({'is_active': 'Нельзя заблокировать свой аккаунт'})
        serializer.save()

    def destroy(self, request, *args, **kwargs):
        if self.get_object().pk == request.user.pk:
            return Response(
                {'detail': 'Нельзя удалить свой аккаунт через этот endpoint'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return super().destroy(request, *args, **kwargs)

    @action(detail=True, methods=['post'])
    def block(self, request, pk=None):
        user = self.get_object()
        if user.pk == request.user.pk:
            return Response({'detail': 'Нельзя заблокировать свой аккаунт'}, status=status.HTTP_400_BAD_REQUEST)
        user.is_active = False
        user.save(update_fields=['is_active'])
        return Response(self.get_serializer(user).data)

    @action(detail=True, methods=['post'])
    def unblock(self, request, pk=None):
        user = self.get_object()
        user.is_active = True
        user.save(update_fields=['is_active'])
        return Response(self.get_serializer(user).data)


class UserAccessLogViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = UserAccessLogSerializer
    permission_classes = [IsAdminUser]
    pagination_class = AdminApiPagination

    def get_queryset(self):
        queryset = UserAccessLog.objects.select_related('user').order_by('-created_at')

        user_id = self.request.query_params.get('user')
        if user_id:
            queryset = queryset.filter(user_id=user_id)

        event = self.request.query_params.get('event')
        if event:
            queryset = queryset.filter(event=event)

        ip_address = self.request.query_params.get('ip')
        if ip_address:
            queryset = queryset.filter(ip_address=ip_address)

        search = (self.request.query_params.get('search') or '').strip()
        if search:
            queryset = queryset.filter(
                Q(identifier__icontains=search) |
                Q(ip_address=search) |
                Q(user_agent__icontains=search) |
                Q(user__email__icontains=search) |
                Q(user__name__icontains=search)
            )

        return queryset
