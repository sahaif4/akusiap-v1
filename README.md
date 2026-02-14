<div align="center">
<img width="1200" height="475" alt="GHBanner" src="" />
</div>



This contains everything you need to run your app locally.



## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

# === LANGKAH 1: PERSIAPAN LINGKUNGAN & LIBRARY ===

# Di dalam folder proyek (misal: C:\aplikasisiappepi), buka terminal.

# 1. Buat & Aktifkan Virtual Environment Python
# Ini akan membuat folder 'venv' di dalam proyek Anda.
python -m venv venv
.\venv\Scripts\activate

# Setelah aktif, terminal akan menampilkan (venv) di depannya.

# 2. INSTALL LIBRARY WAJIB VIA PIP (VERSI TERBARU)
# Pastikan (venv) sudah aktif sebelum menjalankan perintah ini.
pip install django djangorestframework django-cors-headers mysqlclient google-generativeai python-dotenv

# Keterangan:
# - django: Kerangka utama backend.
# - djangorestframework: Untuk membangun API.
# - django-cors-headers: Agar frontend bisa berkomunikasi dengan backend.
# - mysqlclient: "Jembatan" antara Django dan database MySQL.
# - google-generativeai: Library resmi Google untuk Gemini API (versi baru).
# - python-dotenv: Untuk mengelola environment variables seperti API Key.


LANGKAH 2: INISIASI PROYEK
COPY CODE
# === LANGKAH 2: SETUP STRUKTUR PROYEK DJANGO ===

# Di dalam folder proyek (dengan venv aktif), jalankan perintah berikut:

# 1. Buat Proyek Utama Django
# Tanda titik (.) di akhir berarti membuat proyek di folder saat ini.
django-admin startproject siapepi_backend .

# 2. Buat Aplikasi Spesifik untuk Audit
# Ini akan membuat folder baru bernama 'audit_app'
python manage.py startapp audit_app

# 3. KONFIGURASI PROYEK (siapepi_backend/settings.py)
# Buka file settings.py dan lakukan 3 perubahan berikut:

# 3A. Tambahkan aplikasi baru ke INSTALLED_APPS:
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    'rest_framework',
    'corsheaders',
    'audit_app',
]

# 3B. Tambahkan 'CorsMiddleware' ke MIDDLEWARE (SANGAT PENTING!).
# Letakkan di atas 'CommonMiddleware' untuk mengatasi error 'Failed to fetch'.
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware', # <- TAMBAHKAN INI
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]


# 3C. Tambahkan konfigurasi CORS di bagian paling bawah settings.py.
# PENTING: Pilih HANYA SALAH SATU dari dua opsi berikut. JANGAN DIGABUNG.

# ==============================================================================
# OPSI 1 (PALING MUDAH & DIREKOMENDASIKAN UNTUK DEVELOPMENT)
# Cukup tambahkan satu baris ini. Server akan menerima koneksi dari mana saja.
# ==============================================================================
CORS_ALLOW_ALL_ORIGINS = True


# ==============================================================================
# OPSI 2 (LEBIH SPESIFIK)
# Gunakan ini HANYA JIKA Anda TIDAK menggunakan OPSI 1.
# Pastikan OPSI 1 (CORS_ALLOW_ALL_ORIGINS = True) sudah dihapus atau diberi #.
# Error "IndentationError" terjadi jika ada spasi yang salah di depan CORS_ALLOWED_ORIGINS.
# ==============================================================================
# CORS_ALLOWED_ORIGINS = [
#     "http://localhost:3000",
#     "http://127.0.0.1:3000",
# ]


# 4. KONFIGURASI DATABASE (siapepi_backend/settings.py)
# Ganti bagian DATABASES menjadi seperti ini (sesuaikan dengan DB Anda):
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'db_siapi_pepi', # Ganti dengan nama database Anda
        'USER': 'root',
        'PASSWORD': '',  # Kosongkan jika password root MySQL Anda kosong
        'HOST': '127.0.0.1',
        'PORT': '3306',
    }
}

# 4A. BUAT DATABASE DI MYSQL (SANGAT PENTING!)
# Sebelum melanjutkan ke langkah berikutnya, buka HeidiSQL atau phpMyAdmin dari Laragon Anda.
# Buat database baru dengan nama yang sama persis seperti di atas: db_siapi
# (Pastikan collation diatur ke utf8mb4_general_ci jika ada pilihan).
# Django tidak bisa membuat database untuk Anda, hanya tabel di dalamnya.
PENTING: FILE .ENV
Sebelum menjalankan server, buat file bernama .env di root folder proyek dan isi dengan GEMINI_API_KEY="AIza...". Ini penting agar fitur AI berfungsi.
AUDIT_APP/MODELS.PY
COPY CODE
# audit_app/models.py
from django.db import models

class UserProfile(models.Model):
    nama = models.CharField(max_length=255)
    nip = models.CharField(max_length=50, unique=True)
    password = models.CharField(max_length=128, default='pepi123')
    role = models.CharField(max_length=50)
    unit_id = models.IntegerField(blank=True, null=True)
    status = models.CharField(max_length=20, default='aktif')
    assignedUnits = models.JSONField(blank=True, null=True)
    foto = models.TextField(blank=True, null=True) # Menyimpan base64

    def __str__(self):
        return self.nama

class Unit(models.Model):
    nama_unit = models.CharField(max_length=255)
    kode_unit = models.CharField(max_length=10, unique=True)
    jenis_unit = models.CharField(max_length=20) # prodi/pendukung/Manajemen

    def __str__(self):
        return self.nama_unit

class Instrument(models.Model):
    standard = models.CharField(max_length=50, blank=True, default='')
    unit_target = models.CharField(max_length=255, blank=True, default='')
    pertanyaan = models.TextField(blank=True, default='')
    bukti_wajib = models.TextField(blank=True, default='')
    jawaban_auditee = models.TextField(blank=True, null=True)
    doc_file = models.CharField(max_length=255, blank=True, null=True)
    auditor_ids = models.JSONField(blank=True, null=True)
    evaluations = models.JSONField(blank=True, null=True)
    conflict = models.BooleanField(default=False)
    doc_status = models.CharField(max_length=50, default='Belum Diunggah')
    skor_desk = models.IntegerField(blank=True, null=True)
    catatan_desk = models.TextField(blank=True, null=True)
    skor_lapangan = models.IntegerField(blank=True, null=True)
    catatan_lapangan = models.TextField(blank=True, null=True)
    doc_note = models.TextField(blank=True, null=True)
    skor = models.IntegerField(blank=True, null=True)

    def __str__(self):
        return (self.pertanyaan[:75] + '...') if len(self.pertanyaan) > 75 else self.pertanyaan

class Finding(models.Model):
    uraian = models.TextField(blank=True, default='')
    akar_masalah = models.TextField(blank=True, null=True)
    tindakan_koreksi = models.TextField(blank=True, null=True)
    level_risiko = models.CharField(max_length=20, blank=True, default='sedang')
    unit = models.CharField(max_length=255, blank=True, default='')
    standar = models.CharField(max_length=50, blank=True, default='')
    tipe = models.CharField(max_length=20, blank=True, default='minor')
    status_akhir = models.CharField(max_length=50, blank=True, default='Terbuka')
    rencana_tindakan = models.TextField(blank=True, null=True)
    tanggal_target_rtl = models.DateField(blank=True, null=True)
    bukti_rtl = models.CharField(max_length=255, blank=True, null=True)
    catatan_verifikasi = models.TextField(blank=True, null=True)
    status_verifikasi = models.CharField(max_length=50, blank=True, default='Menunggu')
    history = models.JSONField(blank=True, null=True)

    def __str__(self):
        return (self.uraian[:75] + '...') if len(self.uraian) > 75 else self.uraian


AUDIT_APP/SERIALIZERS.PY
COPY CODE
# audit_app/serializers.py
from rest_framework import serializers
from .models import Unit, Instrument, Finding, UserProfile

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = '__all__'

class UnitSerializer(serializers.ModelSerializer):
    class Meta:
        model = Unit
        fields = '__all__'

class InstrumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Instrument
        fields = '__all__'

class FindingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Finding
        fields = '__all__'

AUDIT_APP/VIEWS.PY
COPY CODE
# audit_app/views.py
import os
import json
from dotenv import load_dotenv
import google.generativeai as genai
from rest_framework import viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Finding, Unit, Instrument, UserProfile
from .serializers import FindingSerializer, UnitSerializer, InstrumentSerializer, UserProfileSerializer

# Muat environment variables dari file .env
load_dotenv()

class UserProfileViewSet(viewsets.ModelViewSet):
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer

class UnitViewSet(viewsets.ModelViewSet):
    queryset = Unit.objects.all()
    serializer_class = UnitSerializer

class InstrumentViewSet(viewsets.ModelViewSet):
    queryset = Instrument.objects.all()
    serializer_class = InstrumentSerializer

class FindingViewSet(viewsets.ModelViewSet):
    queryset = Finding.objects.all()
    serializer_class = FindingSerializer

@api_view(['POST'])
def ai_analyze_finding(request):
    uraian = request.data.get('uraian')
    if not uraian:
        return Response({"error": "Uraian tidak boleh kosong"}, status=400)
    
    try:
        # PENTING: Ganti 'GEMINI_API_KEY' dengan nama variabel di file .env Anda
        api_key = os.environ.get("GEMINI_API_KEY") 
        if not api_key:
            return Response({
                "error": "GEMINI_API_KEY tidak ditemukan. Pastikan file .env sudah dibuat dan berisi API Key Anda."
            }, status=500)
        
        genai.configure(api_key=api_key)
        
        # Gunakan model yang direkomendasikan untuk tugas teks dasar
        model = genai.GenerativeModel("gemini-3-flash-preview")
        
        prompt = f"""
        Analisis temuan audit berikut: "{uraian}".
        Berikan "Akar Masalah" (Root Cause) dan "Tindakan Koreksi" (Corrective Action).
        Format jawaban harus dalam bentuk JSON: {{ "akar_masalah": "...", "tindakan_koreksi": "..." }}
        """
        
        # Paksa output menjadi JSON
        response = model.generate_content(
            prompt,
            generation_config={"response_mime_type": "application/json"}
        )
        
        # Langsung parse JSON dari response.text
        analysis_data = json.loads(response.text)

        return Response({"analysis": analysis_data})
    except Exception as e:
        # Error handling yang lebih baik dapat ditambahkan di sini
        return Response({"error": f"Gagal menghubungi Gemini API: {str(e)}"}, status=500)

@api_view(['POST'])
def login_user(request):
    nip = request.data.get('nip')
    password = request.data.get('password')

    if not nip or not password:
        return Response({"error": "NIP and password are required"}, status=400)

    try:
        user = UserProfile.objects.get(nip__iexact=nip)
        # WARNING: In production, use Django's built-in authentication with hashed passwords.
        # This is a simplification for demo purposes.
        if user.password == password:
            user_serializer = UserProfileSerializer(user)
            unit = None
            if user.unit_id:
                try:
                    unit_instance = Unit.objects.get(id=user.unit_id)
                    unit_serializer = UnitSerializer(unit_instance)
                    unit = unit_serializer.data
                except Unit.DoesNotExist:
                    unit = None
            
            return Response({
                "user": user_serializer.data,
                "unit": unit
            })
        else:
            return Response({"error": "Password salah"}, status=401)
    except UserProfile.DoesNotExist:
        return Response({"error": "User tidak ditemukan"}, status=404)

AUDIT_APP/ADMIN.PY
COPY CODE
# audit_app/admin.py (BUAT ATAU EDIT FILE INI)
from django.contrib import admin
from .models import Unit, Instrument, Finding, UserProfile

admin.site.register(Unit)
admin.site.register(Instrument)
admin.site.register(Finding)
admin.site.register(UserProfile)

SIAPEPI_BACKEND/URLS.PY
COPY CODE
# siapepi_backend/urls.py (FILE URL UTAMA PROYEK)
# =======================================================
# PENTING: File ini HANYA boleh berisi kode ini.
# JANGAN tambahkan 'from .views import ...' atau impor lain di sini.
# Tugas file ini adalah mengarahkan semua URL yang dimulai dengan '/api/' 
# ke file urls.py di dalam aplikasi 'audit_app'.

from django.contrib import admin
from django.urls import path, include
from django.views.generic.base import RedirectView

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # Mengarahkan semua request ke /api/ ke aplikasi audit_app
    path('api/', include('audit_app.urls')),

    # Tambahan: Redirect dari halaman root (/) ke /api/
    # agar developer tidak bingung saat membuka alamat server utama.
    path('', RedirectView.as_view(url='/api/', permanent=False)),
]

AUDIT_APP/URLS.PY
COPY CODE
# audit_app/urls.py (BUAT FILE BARU INI)
# =======================================================
# File ini KHUSUS untuk mengatur semua URL di dalam aplikasi 'audit_app'.

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    FindingViewSet, UnitViewSet, InstrumentViewSet, UserProfileViewSet, 
    ai_analyze_finding, login_user
)

# Router ini otomatis membuat URL untuk CRUD (Create, Read, Update, Delete)
router = DefaultRouter()
router.register(r'findings', FindingViewSet, basename='finding')
router.register(r'units', UnitViewSet, basename='unit')
router.register(r'instruments', InstrumentViewSet, basename='instrument')
router.register(r'users', UserProfileViewSet, basename='userprofile')

# Daftar URL untuk aplikasi audit
urlpatterns = [
    # URL untuk CRUD (misal: /api/findings/, /api/units/, /api/users/)
    path('', include(router.urls)),
    
    # URL spesifik
    path('login/', login_user),
    path('analyze-finding/', ai_analyze_finding),
]

AUDIT_APP/MANAGEMENT/COMMANDS/SEED_DATA.PY
COPY CODE
# audit_app/management/commands/seed_data.py (BUAT FILE & FOLDER BARU INI)
# =======================================================
# Struktur Folder:
# audit_app/
# ??? management/
# ?   ??? __init__.py (kosong)
# ?   ??? commands/
# ?       ??? __init__.py (kosong)
# ?       ??? seed_data.py (file ini)
#
# Perintah ini akan mengisi database dengan data awal.
# Jalankan dengan: python manage.py seed_data

from django.core.management.base import BaseCommand
from audit_app.models import Unit, UserProfile

class Command(BaseCommand):
    help = 'Seeds the database with initial data for Units and Users'

    def handle(self, *args, **kwargs):
        self.stdout.write('Menghapus data lama...')
        Unit.objects.all().delete()
        UserProfile.objects.all().delete()

        self.stdout.write('Membuat data baru...')

        units_data = [
            { "id": 1, "kode_unit": "TMP", "nama_unit": "Prodi Teknologi Mekanisasi Pertanian", "jenis_unit": "prodi" },
            { "id": 2, "kode_unit": "TAP", "nama_unit": "Prodi Tata Air Pertanian", "jenis_unit": "prodi" },
            { "id": 3, "kode_unit": "THP", "nama_unit": "Prodi Teknologi Hasil Pertanian", "jenis_unit": "prodi" },
            { "id": 4, "kode_unit": "DIR", "nama_unit": "Direktorat", "jenis_unit": "Manajemen" },
            { "id": 5, "kode_unit": "UPM", "nama_unit": "Unit Penjaminan Mutu", "jenis_unit": "pendukung" },
            { "id": 6, "kode_unit": "AAK", "nama_unit": "Bagian Administrasi Akademik & Kemahasiswaan", "jenis_unit": "pendukung" },
            { "id": 7, "kode_unit": "UMUM", "nama_unit": "Subbagian Umum", "jenis_unit": "pendukung" },
        ]
        for data in units_data:
            Unit.objects.create(**data)
        self.stdout.write(self.style.SUCCESS(f'{len(units_data)} Unit berhasil dibuat.'))

        users_data = [
            { "id": 1, "nama": "Dr. Ir. Harmanto, M.Eng.", "nip": "harmanto", "role": "Direktur", "unit_id": 4, "password": "pepi123" },
            { "id": 2, "nama": "Dr. Andy Saryoko, S.P., M.P.", "nip": "andy", "role": "Wakil Direktur", "unit_id": 4, "password": "pepi123" },
            { "id": 3, "nama": "Mas Wisnu Aninditya, S.TP., M.Si.", "nip": "wisnu", "role": "Admin UPM", "unit_id": 5, "password": "pepi123" },
            { "id": 10, "nama": "Irwanto, S.Si., M.Pd.", "nip": "irwanto", "role": "Auditor", "unit_id": 3, "assignedUnits": '["TMP", "TAP"]', "password": "pepi123" },
            { "id": 12, "nama": "Dr. Mardison S, S.TP., M.Si.", "nip": "mardison", "role": "Auditor", "unit_id": 1, "assignedUnits": '["THP", "TMP"]', "password": "pepi123" },
            { "id": 20, "nama": "Dyah Ayu Shofiati (Shofie)", "nip": "shofie", "role": "Admin Prodi", "unit_id": 1, "password": "pepi123" },
            { "id": 21, "nama": "Rivani Yuniar, A.Md.P.", "nip": "rivani", "role": "Admin Prodi", "unit_id": 3, "password": "pepi123" },
            { "id": 22, "nama": "Rifari Satrio Sasongkojati (Satrio)", "nip": "satrio", "role": "Admin Prodi", "unit_id": 2, "password": "pepi123" },
            { "id": 99, "nama": "Super Admin SIAPI", "nip": "superadmin", "role": "Super Admin", "unit_id": 5, "password": "pepi123" },
        ]
        for data in users_data:
            UserProfile.objects.create(**data)
        self.stdout.write(self.style.SUCCESS(f'{len(users_data)} User Profile berhasil dibuat.'))


LANGKAH FINAL: MIGRASI & RUN
COPY CODE
# === LANGKAH FINAL: MIGRASI, SEED DATA & JALANKAN SERVER ===

# Setelah semua file di atas dibuat dan dikonfigurasi, jalankan perintah ini:
# PASTIKAN DATABASE 'db_siapi_pepi' SUDAH DIBUAT DI MYSQL!

# 1. BUAT & DAFTARKAN MODEL KE ADMIN
# Perintah ini akan membaca models.py dan membuat "resep" tabel baru
python manage.py makemigrations

# Perintah ini akan menerapkan "resep" tersebut ke database MySQL Anda
python manage.py migrate

# 2. BUAT SUPERUSER (Untuk akses halaman admin Django)
# Anda akan diminta membuat username & password. Ini BEDA dengan akun di aplikasi.
python manage.py createsuperuser

# 3. ISI DATA AWAL (SEEDING)
# Perintah ini akan menjalankan script seed_data.py yang baru kita buat
python manage.py seed_data

# 4. JALANKAN SERVER
python manage.py runserver

# === SELESAI ===
# Backend Anda sekarang berjalan di: http://127.0.0.1:8000/api/
# Halaman admin bisa diakses di: http://127.0.0.1:8000/admin/





