# audit_app/tests/test_permissions.py
import pytest
from rest_framework.test import APIClient
from audit_app.models import User, Unit, Standard, AuditCycle, Instrument, AuditResponse
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import User
from .models import (
    UserProfile, Unit, Standard, Instrument, Finding, AuditCycle,
    AuditAssignment, AuditResponse, DeskEvaluationScore,
    ClarificationThread, ClarificationMessage
)

# --- Integrasi UserProfile ke dalam User Admin ---
# Ini memungkinkan kita mengedit UserProfile langsung dari halaman User.
class UserProfileInline(admin.StackedInline):
    model = UserProfile
    can_delete = False
    verbose_name_plural = 'Profil Tambahan Pengguna'

# Definisikan User admin kustom yang baru
class UserAdmin(BaseUserAdmin):
    inlines = (UserProfileInline,)

# Batalkan pendaftaran User Admin bawaan, lalu daftarkan yang kustom
admin.site.unregister(User)
admin.site.register(User, UserAdmin)

# --- Konfigurasi Tampilan untuk Model Lainnya ---

@admin.register(Unit)
class UnitAdmin(admin.ModelAdmin):
    list_display = ('name', 'code', 'type')
    search_fields = ('name', 'code')
    list_filter = ('type',)

@admin.register(Instrument)
class InstrumentAdmin(admin.ModelAdmin):
    list_display = ('question_text', 'standard', 'unit', 'audit_cycle')
    list_filter = ('audit_cycle', 'standard', 'unit')
    search_fields = ('question_text',)

@admin.register(Finding)
class FindingAdmin(admin.ModelAdmin):
    list_display = ('uraian', 'unit', 'tipe', 'status_akhir')
    list_filter = ('unit', 'tipe', 'status_akhir', 'level_risiko')
    search_fields = ('uraian',)

# --- Daftarkan Model Lainnya (yang tidak butuh kustomisasi) ---
admin.site.register(Standard)
admin.site.register(AuditCycle)
admin.site.register(AuditAssignment)
admin.site.register(AuditResponse)
admin.site.register(DeskEvaluationScore)
admin.site.register(ClarificationThread)
admin.site.register(ClarificationMessage)
# Catatan: UserProfile tidak perlu didaftarkan di sini karena sudah 'inline'
