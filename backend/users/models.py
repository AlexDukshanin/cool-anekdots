from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.db import models
from django.utils import timezone


class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, name=None, nickname=None, **extra_fields):
        if not email:
            raise ValueError("У пользователя должен быть email")
        email = self.normalize_email(email)
        name = nickname or name or email.split('@')[0]
        user = self.model(email=email, name=name, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, name=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, password, name, **extra_fields)
    

class CustomUser(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True)
    name = models.CharField("Никнейм", max_length=200)
    age = models.DateField(null=True, blank=True)
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True, default='../static/user.png')
    created_at = models.DateTimeField(default=timezone.now)
    registration_ip = models.GenericIPAddressField("IP регистрации", null=True, blank=True)
    registration_user_agent = models.TextField("User-Agent при регистрации", blank=True)
    last_login_ip = models.GenericIPAddressField("IP последнего входа", null=True, blank=True)
    last_login_user_agent = models.TextField("User-Agent последнего входа", blank=True)
    last_login_at = models.DateTimeField("Время последнего входа", null=True, blank=True)

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    objects = CustomUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name']

    def __str__(self):
        return self.name or self.email
    
    class Meta:
        verbose_name = "Пользователь"
        verbose_name_plural = "Пользователи"


class UserAccessLog(models.Model):
    REGISTRATION = 'registration'
    LOGIN_SUCCESS = 'login_success'
    LOGIN_FAILED = 'login_failed'

    EVENT_CHOICES = (
        (REGISTRATION, 'Регистрация'),
        (LOGIN_SUCCESS, 'Успешный вход'),
        (LOGIN_FAILED, 'Неудачный вход'),
    )

    user = models.ForeignKey(
        CustomUser,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='access_logs',
        verbose_name='Пользователь',
    )
    event = models.CharField('Событие', max_length=32, choices=EVENT_CHOICES)
    identifier = models.CharField('Введённый никнейм/email', max_length=255, blank=True)
    ip_address = models.GenericIPAddressField('IP адрес', null=True, blank=True)
    user_agent = models.TextField('User-Agent', blank=True)
    path = models.CharField('Путь запроса', max_length=255, blank=True)
    created_at = models.DateTimeField('Время', default=timezone.now)

    class Meta:
        ordering = ('-created_at',)
        verbose_name = 'Событие доступа'
        verbose_name_plural = 'Журнал доступа'

    def __str__(self):
        user = self.user.name if self.user else self.identifier or 'аноним'
        return f'{self.get_event_display()}: {user} ({self.ip_address or "IP не определён"})'
