from django.utils import timezone

from .models import UserAccessLog


def get_client_ip(request):
    if not request:
        return None

    forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if forwarded_for:
        return forwarded_for.split(',')[0].strip() or None

    return request.META.get('REMOTE_ADDR') or None


def get_user_agent(request):
    if not request:
        return ''
    return request.META.get('HTTP_USER_AGENT', '')[:2000]


def record_access_event(event, request, user=None, identifier=''):
    UserAccessLog.objects.create(
        user=user,
        event=event,
        identifier=(identifier or '')[:255],
        ip_address=get_client_ip(request),
        user_agent=get_user_agent(request),
        path=(request.path if request else '')[:255],
    )


def save_registration_audit(user, request):
    user.registration_ip = get_client_ip(request)
    user.registration_user_agent = get_user_agent(request)
    user.last_login_ip = user.registration_ip
    user.last_login_user_agent = user.registration_user_agent
    user.last_login_at = timezone.now()
    user.last_login = user.last_login_at
    user.save(
        update_fields=[
            'registration_ip',
            'registration_user_agent',
            'last_login_ip',
            'last_login_user_agent',
            'last_login_at',
            'last_login',
        ]
    )


def save_login_audit(user, request):
    user.last_login_ip = get_client_ip(request)
    user.last_login_user_agent = get_user_agent(request)
    user.last_login_at = timezone.now()
    user.last_login = user.last_login_at
    user.save(
        update_fields=[
            'last_login_ip',
            'last_login_user_agent',
            'last_login_at',
            'last_login',
        ]
    )
