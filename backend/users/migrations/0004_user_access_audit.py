import django.db.models.deletion
import django.utils.timezone
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0003_alter_customuser_name'),
    ]

    operations = [
        migrations.AddField(
            model_name='customuser',
            name='last_login_at',
            field=models.DateTimeField(blank=True, null=True, verbose_name='Время последнего входа'),
        ),
        migrations.AddField(
            model_name='customuser',
            name='last_login_ip',
            field=models.GenericIPAddressField(blank=True, null=True, verbose_name='IP последнего входа'),
        ),
        migrations.AddField(
            model_name='customuser',
            name='last_login_user_agent',
            field=models.TextField(blank=True, verbose_name='User-Agent последнего входа'),
        ),
        migrations.AddField(
            model_name='customuser',
            name='registration_ip',
            field=models.GenericIPAddressField(blank=True, null=True, verbose_name='IP регистрации'),
        ),
        migrations.AddField(
            model_name='customuser',
            name='registration_user_agent',
            field=models.TextField(blank=True, verbose_name='User-Agent при регистрации'),
        ),
        migrations.CreateModel(
            name='UserAccessLog',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('event', models.CharField(choices=[('registration', 'Регистрация'), ('login_success', 'Успешный вход'), ('login_failed', 'Неудачный вход')], max_length=32, verbose_name='Событие')),
                ('identifier', models.CharField(blank=True, max_length=255, verbose_name='Введённый никнейм/email')),
                ('ip_address', models.GenericIPAddressField(blank=True, null=True, verbose_name='IP адрес')),
                ('user_agent', models.TextField(blank=True, verbose_name='User-Agent')),
                ('path', models.CharField(blank=True, max_length=255, verbose_name='Путь запроса')),
                ('created_at', models.DateTimeField(default=django.utils.timezone.now, verbose_name='Время')),
                ('user', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='access_logs', to='users.customuser', verbose_name='Пользователь')),
            ],
            options={
                'verbose_name': 'Событие доступа',
                'verbose_name_plural': 'Журнал доступа',
                'ordering': ('-created_at',),
            },
        ),
    ]
