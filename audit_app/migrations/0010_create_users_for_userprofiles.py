# Data migration to create User instances for existing UserProfiles

from django.db import migrations
from django.contrib.auth.models import User


def create_users_for_userprofiles(apps, schema_editor):
    User = apps.get_model('auth', 'User')
    UserProfile = apps.get_model('audit_app', 'UserProfile')
    for profile in UserProfile.objects.all():
        if profile.user is None:
            user = User.objects.create_user(
                username=profile.nip,
                email=f"{profile.nip}@example.com",
                password=profile.password,
                first_name=profile.nama.split()[0] if profile.nama else '',
                last_name=' '.join(profile.nama.split()[1:]) if profile.nama and len(profile.nama.split()) > 1 else ''
            )
            profile.user = user
            profile.save()


def reverse_create_users_for_userprofiles(apps, schema_editor):
    # Reverse is not needed as this is data creation
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('audit_app', '0009_userprofile_user'),
    ]

    operations = [
        migrations.RunPython(create_users_for_userprofiles, reverse_create_users_for_userprofiles),
    ]
