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
    is_published = models.BooleanField(default=False)

    def __str__(self):
        return (self.pertanyaan[:75] + '...') if len(self.pertanyaan) > 75 else self.pertanyaan

class QuestionBank(models.Model):
    set_type = models.CharField(max_length=20, choices=[('sndikti', 'Standar SNDikti'), ('unggul', 'Standar Unggul')], default='sndikti')
    standard = models.CharField(max_length=50, blank=True, default='')
    pertanyaan = models.TextField(blank=True, default='')
    bukti_wajib = models.TextField(blank=True, default='')

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

class AuditCycle(models.Model):
    name = models.CharField(max_length=255)
    status = models.CharField(max_length=50, default='Perencanaan')  # Aktif, Selesai, Perencanaan
    progress = models.IntegerField(default=0)
    start_date = models.DateField()
    end_date = models.DateField()

    def __str__(self):
        return self.name

class AuditAssignment(models.Model):
    audit_cycle = models.ForeignKey(AuditCycle, on_delete=models.CASCADE)
    unit = models.ForeignKey(Unit, on_delete=models.CASCADE)
    auditor1 = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='auditor1_assignments')
    auditor2 = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='auditor2_assignments')
    status = models.CharField(max_length=50, default='DESK_EVALUATION') # DESK_EVALUATION, FIELD_AUDIT, FINISHED
    assigned_date = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('audit_cycle', 'unit')  # One assignment per cycle per unit

    def __str__(self):
        return f"{self.audit_cycle.name} - {self.unit.nama_unit}"

class DeskEvaluation(models.Model):
    instrument = models.ForeignKey(Instrument, on_delete=models.CASCADE)
    auditor = models.ForeignKey(UserProfile, on_delete=models.CASCADE)
    score = models.IntegerField(null=True, blank=True)
    note = models.TextField(blank=True)
    status = models.CharField(max_length=20, default='PENDING')
    doc_note = models.TextField(blank=True)
    is_complete = models.BooleanField(default=False)
    assigned_date = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('instrument', 'auditor')

    def __str__(self):
        return f"{self.instrument.pertanyaan[:50]} - {self.auditor.nama}"

class ActivityLog(models.Model):
    user = models.ForeignKey(UserProfile, on_delete=models.CASCADE)
    action = models.CharField(max_length=255)
    target = models.CharField(max_length=255, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.nama} - {self.action}"

class StandardDocument(models.Model):
    nama_dokumen = models.CharField(max_length=255)
    file = models.FileField(upload_to='standard_documents/', blank=True, null=True)
    kategori = models.CharField(max_length=100, blank=True, null=True)
    tanggal_upload = models.DateTimeField(auto_now_add=True)
    uploaded_by = models.ForeignKey(UserProfile, on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return self.nama_dokumen


class UPMProfile(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    vision = models.TextField(blank=True)
    mission = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name


class UPMProgram(models.Model):
    name = models.TextField()
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    profile = models.ForeignKey(UPMProfile, on_delete=models.CASCADE, related_name='programs')

    def __str__(self):
        return self.name


class UPMMember(models.Model):
    class Division(models.TextChoices):
        PIMPINAN = 'PIMPINAN', 'Pimpinan'
        MUTU = 'MUTU', 'Manajemen Mutu & Akreditasi'
        MONEV = 'MONEV', 'Monitoring & Evaluasi'
        TUK = 'TUK', 'Tempat Uji Kompetensi'

    class MemberRole(models.TextChoices):
        KETUA = 'KETUA', 'Ketua UPM'
        SEKRETARIS = 'SEKRETARIS', 'Sekretaris UPM'
        KOORDINATOR = 'KOORDINATOR', 'Koordinator'
        ANGGOTA = 'ANGGOTA', 'Anggota'

    name = models.CharField(max_length=255)
    nip = models.CharField(max_length=50, blank=True)
    is_active = models.BooleanField(default=True)
    division = models.CharField(max_length=100, choices=Division.choices, blank=True, null=True)
    order = models.PositiveIntegerField(default=1)
    role = models.CharField(max_length=50, choices=MemberRole.choices, blank=True)
    description = models.TextField(blank=True) # Uraian Tugas
    parent = models.ForeignKey('self', on_delete=models.SET_NULL, related_name='children', null=True, blank=True)
    profile = models.ForeignKey(UPMProfile, on_delete=models.CASCADE, related_name='members')

    class Meta:
        ordering = ['order']

    def __str__(self):
        return self.name


class UPMAgenda(models.Model):
    class AgendaStatus(models.TextChoices):
        PLANNED = 'planned', 'Planned'
        ONGOING = 'ongoing', 'Ongoing'
        DONE = 'done', 'Done'

    class AgendaType(models.TextChoices):
        ROADMAP = 'roadmap', 'Roadmap'
        DEADLINE = 'deadline', 'Deadline'
        REMINDER = 'reminder', 'Reminder'
        CYCLE = 'cycle', 'Cycle'
        CYCLE_EVENT = 'cycle_event', 'Cycle Event'
        STRATEGIC = 'strategic', 'Strategic'

    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    start_date = models.DateField()
    target_date = models.DateField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=AgendaStatus.choices, default=AgendaStatus.PLANNED)
    agenda_type = models.CharField(max_length=20, choices=AgendaType.choices, default=AgendaType.ROADMAP)
    responsible_unit = models.CharField(max_length=255, blank=True)
    reminder_days_before = models.PositiveIntegerField(default=180)
    is_active = models.BooleanField(default=True)
    progress = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    units = models.ManyToManyField(Unit, blank=True, related_name='upm_agendas')

    class Meta:
        ordering = ['start_date', 'target_date', 'id']

    def __str__(self):
        return self.title
