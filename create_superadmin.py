import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'siapepi_backend.settings')
django.setup()

from django.contrib.auth import get_user_model
User = get_user_model()

# Check if superadmin exists
u = User.objects.filter(username='superadmin').first()
if not u:
    User.objects.create_user(username='superadmin', password='pepi123', is_superuser=True, is_staff=True)
    print('Superadmin user created')
else:
    u.set_password('pepi123')
    u.is_superuser = True
    u.is_staff = True
    u.save()
    print('Superadmin user updated')
