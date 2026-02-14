import React, { useState } from 'react';
import { 
  Terminal, Play, Database, Cpu, Layers, Copy, Network, CheckCircle2, FolderCog, GitMerge, AlertTriangle, ShieldCheck, PackagePlus, FolderTree, Code, Fingerprint, KeyRound, TestTube2, Library
} from 'lucide-react';

const BackendPreviewView: React.FC = () => {
  const [activeTab, setActiveTab] = useState('install');

  const codeSnippets = {
    install: `# === BAGIAN 1: PERSIAPAN & INSTALASI ===

# Di folder proyek, buka terminal dan jalankan:

# 1. Buat & Aktifkan Virtual Environment
python -m venv venv
.\\venv\\Scripts\\activate

# 2. Install Library Wajib
pip install django djangorestframework django-cors-headers mysqlclient google-generativeai djangorestframework-simplejwt Pillow pytest-django python-dotenv`,

    setup: `# siapepi_backend/settings.py

# ... (konfigurasi lainnya) ...

# --- KONFIGURASI DATABASE MYSQL (PENTING) ---
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'db_siapepi', # Nama database yang dibuat di Laragon
        'USER': 'root',
        'PASSWORD': '', # Default password Laragon
        'HOST': '127.0.0.1',
        'PORT': '3306',
        'OPTIONS': {
            'init_command': "SET sql_mode='STRICT_TRANS_TABLES'",
        },
    }
}
# --- AKHIR KONFIGURASI DATABASE ---

AUTH_USER_MODEL = 'audit_app.User'

CORS_ALLOW_ALL_ORIGINS = True

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    )
}

from datetime import timedelta
SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=60),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=1),
}

# Static and Media files
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'
`,

    models: `# audit_app/models.py
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings

class User(AbstractUser):
    ROLE_CHOICES = [('Super Admin', 'Super Admin'), ('Admin UPM', 'Admin UPM'), ('Admin Prodi', 'Admin Prodi'), ('Auditor', 'Auditor'), ('Auditee', 'Auditee'), ('Direktur', 'Direktur'), ('Wakil Direktur', 'Wakil Direktur'), ('Ketua Program Studi', 'Ketua Program Studi')]
    role = models.CharField(max_length=50, choices=ROLE_CHOICES, default='Auditee')
    unit = models.ForeignKey('Unit', on_delete=models.SET_NULL, null=True, blank=True)
    assigned_units = models.JSONField(default=list, blank=True)
    foto = models.TextField(blank=True, null=True)

# ... (Model lainnya tidak berubah) ...
`,

    'policies_base': `# audit_app/policies/base.py
class BasePolicy:
    def get_user_role(self, user):
        if not user or not user.is_authenticated or not hasattr(user, 'role'):
            return None
        return user.role

    def has_permission(self, user, action, obj=None):
        return False
`,

    'policies_user': `# audit_app/policies/user_policy.py
from .base import BasePolicy

class UserPolicy(BasePolicy):
    PERMISSIONS = {
        'Super Admin': ['read', 'create', 'update', 'delete'],
        'Admin UPM': ['read'], 'Admin Prodi': ['read'],
        'Auditor': ['read'], 'Auditee': ['read'],
    }

    def has_permission(self, user, action, obj=None):
        role = self.get_user_role(user)
        return action in self.PERMISSIONS.get(role, [])
`,

    'policies_unit': `# audit_app/policies/unit_policy.py
from .base import BasePolicy

class UnitPolicy(BasePolicy):
    PERMISSIONS = {
        'Super Admin': ['read', 'create', 'update', 'delete'],
        'Admin UPM': ['read'], 'Admin Prodi': ['read'],
        'Auditor': ['read'], 'Auditee': ['read'],
    }

    def has_permission(self, user, action, obj=None):
        role = self.get_user_role(user)
        return action in self.PERMISSIONS.get(role, [])
`,

    'policies_instrument': `# audit_app/policies/instrument_policy.py
from .base import BasePolicy

class InstrumentPolicy(BasePolicy):
    PERMISSIONS = {
        'Super Admin': ['read', 'create', 'update', 'delete'],
        'Admin Prodi': ['read', 'create'],
        'Admin UPM': ['read'], 'Auditor': ['read'], 'Auditee': ['read'],
    }

    def has_permission(self, user, action, obj=None):
        role = self.get_user_role(user)
        return action in self.PERMISSIONS.get(role, [])
`,
    
    'policies_desk_eval': `# audit_app/policies/desk_evaluation_policy.py
from .base import BasePolicy

class DeskEvaluationPolicy(BasePolicy):
    PERMISSIONS = {
        'Auditor': ['submit_score', 'read_response'],
        'Auditee': ['submit_response', 'read_response'],
        'Admin Prodi': ['submit_response', 'read_response'],
        'Super Admin': ['read_response'],
    }

    def has_permission(self, user, action, obj=None):
        role = self.get_user_role(user)
        return action in self.PERMISSIONS.get(role, [])
`,
    'policies_finding': `# audit_app/policies/finding_policy.py (FILE BARU)
from .base import BasePolicy

class FindingPolicy(BasePolicy):
    """Aturan akses untuk model Finding. (ReadOnlyOrAdmin)"""
    def has_permission(self, user, action, obj=None):
        role = self.get_user_role(user)
        if action == 'read':
            return True # Semua role terautentikasi bisa membaca
        if action in ['create', 'update', 'delete']:
            return role == 'Super Admin'
        return False
`,

    'policies_general': `# audit_app/policies/general_policy.py (FILE BARU)
from .base import BasePolicy

class GeneralReadOnlyPolicy(BasePolicy):
    """Policy generik untuk data yang bisa dibaca semua, tapi hanya ditulis Super Admin."""
    def has_permission(self, user, action, obj=None):
        role = self.get_user_role(user)
        if action == 'read':
            return True
        if action in ['create', 'update', 'delete']:
            return role == 'Super Admin'
        return False

class GeneralApiPolicy(BasePolicy):
    """Policy untuk endpoint API umum yang hanya butuh user terautentikasi."""
    def has_permission(self, user, action, obj=None):
        # Aksi bisa berupa 'access', 'analyze', dll.
        return self.get_user_role(user) is not None
`,

    permissions: `# audit_app/permissions.py
from rest_framework.permissions import BasePermission

def IsAllowed(policy_class, action):
    class PolicyPermission(BasePermission):
        def has_permission(self, request, view):
            policy = policy_class()
            return policy.has_permission(request.user, action)
    return PolicyPermission

class GenericPolicyPermission(BasePermission):
    def has_permission(self, request, view):
        if not hasattr(view, 'policy_class') or not hasattr(view, 'action_map'):
            return False
        action = view.action_map.get(view.action)
        if not action:
            return False
        policy = view.policy_class()
        return policy.has_permission(request.user, action)
`,
    views: `# audit_app/views.py (REFACTOR FINAL)
from rest_framework import viewsets, permissions
from rest_framework.decorators import api_view, permission_classes
# ... (import model & serializer lainnya)

# --- Import Policy & Permission Baru ---
from .permissions import GenericPolicyPermission, IsAllowed
from .policies.user_policy import UserPolicy
from .policies.unit_policy import UnitPolicy
from .policies.instrument_policy import InstrumentPolicy
from .policies.finding_policy import FindingPolicy
from .policies.desk_evaluation_policy import DeskEvaluationPolicy
from .policies.general_policy import GeneralReadOnlyPolicy, GeneralApiPolicy

# --- VIEWSET DENGAN PBAC ---
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all(); serializer_class = UserSerializer
    policy_class = UserPolicy; permission_classes = [GenericPolicyPermission]
    action_map = {'list':'read', 'retrieve':'read', 'create':'create', 'update':'update', 'partial_update':'update', 'destroy':'delete'}

class UnitViewSet(viewsets.ModelViewSet):
    queryset = Unit.objects.all(); serializer_class = UnitSerializer
    policy_class = UnitPolicy; permission_classes = [GenericPolicyPermission]
    action_map = {'list':'read', 'retrieve':'read', 'create':'create', 'update':'update', 'partial_update':'update', 'destroy':'delete'}

class FindingViewSet(viewsets.ModelViewSet):
    queryset = Finding.objects.all(); serializer_class = FindingSerializer
    policy_class = FindingPolicy; permission_classes = [GenericPolicyPermission]
    action_map = {'list':'read', 'retrieve':'read', 'create':'create', 'update':'update', 'partial_update':'update', 'destroy':'delete'}

class StandardViewSet(viewsets.ModelViewSet):
    queryset = Standard.objects.all(); serializer_class = StandardSerializer
    policy_class = GeneralReadOnlyPolicy; permission_classes = [GenericPolicyPermission]
    action_map = {'list':'read', 'retrieve':'read', 'create':'create', 'update':'update', 'partial_update':'update', 'destroy':'delete'}

class AuditCycleViewSet(viewsets.ModelViewSet):
    queryset = AuditCycle.objects.all(); serializer_class = AuditCycleSerializer
    policy_class = GeneralReadOnlyPolicy; permission_classes = [GenericPolicyPermission]
    action_map = {'list':'read', 'retrieve':'read', 'create':'create', 'update':'update', 'partial_update':'update', 'destroy':'delete'}

class InstrumentViewSet(viewsets.ModelViewSet):
    queryset = Instrument.objects.all(); serializer_class = InstrumentSerializer
    policy_class = InstrumentPolicy; permission_classes = [GenericPolicyPermission]
    action_map = {'list':'read', 'retrieve':'read', 'create':'create', 'update':'update', 'partial_update':'update', 'destroy':'delete'}

# --- APIVIEW DENGAN PBAC ---
@api_view(['POST'])
@permission_classes([IsAllowed(DeskEvaluationPolicy, 'submit_response')])
def submit_audit_response(request): # ... logika view
    pass

@api_view(['POST'])
@permission_classes([IsAllowed(DeskEvaluationPolicy, 'submit_score')])
def submit_desk_score(request): # ... logika view
    pass

@api_view(['GET'])
@permission_classes([IsAllowed(GeneralApiPolicy, 'access')])
def dashboard_data(request): # ... logika view
    pass

@api_view(['POST'])
@permission_classes([IsAllowed(GeneralApiPolicy, 'analyze')])
def analyze_finding_ai(request): # ... logika view
    pass
`,
    urls: `# audit_app/urls.py
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter
from .views import (
    UserViewSet, UnitViewSet, FindingViewSet, StandardViewSet, AuditCycleViewSet, InstrumentViewSet,
    # ... import view lainnya
)

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'units', UnitViewSet)
router.register(r'findings', FindingViewSet)
router.register(r'standards', StandardViewSet)
router.register(r'audit-cycles', AuditCycleViewSet)
router.register(r'instruments', InstrumentViewSet)

urlpatterns = [
    path('', include(router.urls)),
    # ... path lainnya
]

# --- KONFIGURASI FILE UPLOAD (PENTING) ---
# Tambahkan baris ini agar file yang diupload bisa diakses saat development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
`,
    tests: `# audit_app/tests/test_permissions.py (Tidak perlu diubah)`,
    finalize: `# === BAGIAN FINAL: MIGRASI & JALANKAN ===
# Pastikan sudah install python-dotenv: pip install python-dotenv
# Buat file .env di root folder, isi dengan:
# GEMINI_API_KEY=KUNCI_API_ANDA

python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver

# === UJI COBA ===
pytest
`
  };

  const tabs = [
    { id: 'install', label: '1. Instalasi', icon: Play },
    { id: 'setup', label: '2. Setup Proyek', icon: FolderCog },
    { id: 'models', label: '3. Models.py', icon: Database },
    { id: 'policies_base', label: '4. policies/base.py', icon: Library },
    { id: 'policies_user', label: '5. UserPolicy', icon: Library },
    { id: 'policies_unit', label: '6. UnitPolicy', icon: Library },
    { id: 'policies_instrument', label: '7. InstrumentPolicy', icon: Library },
    { id: 'policies_desk_eval', label: '8. DeskEvalPolicy', icon: Library },
    { id: 'policies_finding', label: '9. FindingPolicy', icon: Library },
    { id: 'policies_general', label: '10. GeneralPolicy', icon: Library },
    { id: 'permissions', label: '11. Permissions.py', icon: KeyRound },
    { id: 'views', label: '12. Views.py', icon: Cpu },
    { id: 'urls', label: '13. URLs.py', icon: GitMerge },
    { id: 'tests', label: '14. Tests.py', icon: TestTube2 },
    { id: 'finalize', label: '15. Finalisasi', icon: CheckCircle2 }
  ];

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-500">
      <div className="bg-slate-900 text-white p-10 rounded-[3rem] shadow-2xl relative overflow-hidden border border-slate-800">
         <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] -mr-20 -mt-20"></div>
         <div className="relative z-10">
            <h2 className="text-3xl font-black uppercase tracking-tighter mb-2">Refactor ke Policy-Based Access Control (PBAC)</h2>
            <p className="text-slate-400 text-sm max-w-2xl font-medium leading-relaxed">
               Mengimplementasikan arsitektur perizinan yang terpusat, dapat digunakan kembali, dan mudah diaudit.
            </p>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-1 space-y-2">
           {tabs.map((item: any) => (
             <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === item.id ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200' : 'bg-white text-slate-500 hover:bg-slate-100 border border-slate-200'}`}>
               <item.icon size={16} /> {item.label}
             </button>
           ))}
        </div>

        <div className="lg:col-span-4">
           <div className="bg-slate-900 rounded-[2.5rem] border border-slate-800 shadow-2xl overflow-hidden">
              <div className="px-8 py-4 bg-slate-800/50 border-b border-slate-800 flex justify-between items-center">
                 <div className="flex gap-2"><div className="w-3 h-3 rounded-full bg-rose-500"></div><div className="w-3 h-3 rounded-full bg-amber-500"></div><div className="w-3 h-3 rounded-full bg-emerald-500"></div></div>
                 <button onClick={() => navigator.clipboard.writeText(codeSnippets[activeTab as keyof typeof codeSnippets])} className="text-xs font-bold text-indigo-400 hover:text-white transition-all flex items-center gap-2"><Copy size={14}/> COPY CODE</button>
              </div>
              <div className="p-8 overflow-x-auto"><pre className="text-emerald-400 font-mono text-xs leading-relaxed">{codeSnippets[activeTab as keyof typeof codeSnippets]}</pre></div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default BackendPreviewView;