from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, UserAccessLog


class UserAccessLogInline(admin.TabularInline):
    model = UserAccessLog
    fields = ('created_at', 'event', 'identifier', 'ip_address', 'user_agent', 'path')
    readonly_fields = fields
    extra = 0
    can_delete = False
    verbose_name = 'Событие доступа'
    verbose_name_plural = 'Последние события доступа'

    def has_add_permission(self, request, obj=None):
        return False


class CustomUserAdmin(UserAdmin):
    model = CustomUser
    list_display = (
        'email',
        'nickname',
        'created_at',
        'registration_ip',
        'last_login_at',
        'last_login_ip',
        'is_active',
        'is_staff',
    )
    list_filter = ('is_active', 'is_staff', 'is_superuser', 'created_at', 'last_login_at')
    ordering = ('email',)
    search_fields = ('email', 'name', 'registration_ip', 'last_login_ip')
    readonly_fields = (
        'created_at',
        'last_login',
        'registration_ip',
        'registration_user_agent',
        'last_login_ip',
        'last_login_user_agent',
        'last_login_at',
    )
    actions = ('block_users', 'unblock_users')
    inlines = (UserAccessLogInline,)

    @admin.display(description='Никнейм')
    def nickname(self, obj):
        return obj.name

    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Профиль',
         {'fields': ('name', 'avatar')})
         ,
        ('Аудит',
         {'fields': (
             'created_at',
             'registration_ip',
             'registration_user_agent',
             'last_login_at',
             'last_login_ip',
             'last_login_user_agent',
         )}),
        ('Права доступа', 
         {'fields': ('is_staff', 'is_active', 'is_superuser', 'groups', 'user_permissions')}
         ),
        ('Важные даты', 
         {'fields': ('last_login',)}
         ),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'name', 'avatar', 'password1', 'password2'),
        }),
    
    )

    @admin.action(description='Заблокировать выбранных пользователей')
    def block_users(self, request, queryset):
        updated = queryset.exclude(pk=request.user.pk).update(is_active=False)
        self.message_user(request, f'Заблокировано пользователей: {updated}')

    @admin.action(description='Разблокировать выбранных пользователей')
    def unblock_users(self, request, queryset):
        updated = queryset.update(is_active=True)
        self.message_user(request, f'Разблокировано пользователей: {updated}')


@admin.register(UserAccessLog)
class UserAccessLogAdmin(admin.ModelAdmin):
    list_display = ('created_at', 'event', 'user', 'identifier', 'ip_address', 'path')
    list_filter = ('event', 'created_at')
    search_fields = ('user__email', 'user__name', 'identifier', 'ip_address', 'user_agent')
    readonly_fields = ('created_at', 'event', 'user', 'identifier', 'ip_address', 'user_agent', 'path')
    date_hierarchy = 'created_at'
    ordering = ('-created_at',)

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False


admin.site.register(CustomUser, CustomUserAdmin)
