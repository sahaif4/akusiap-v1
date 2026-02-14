"""
URL configuration for siappepi project.
"""
from django.contrib import admin
from django.urls import path, include
from django.views.generic.base import RedirectView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('audit_app.urls')),
    path('', RedirectView.as_view(url='/api/', permanent=False)),
]
