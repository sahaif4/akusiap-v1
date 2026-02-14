from django.core.management.base import BaseCommand
from audit_app.models import Unit, UserProfile, Instrument, Finding, QuestionBank

class Command(BaseCommand):
    help = 'Seeds the database with initial data for Units, Users, Instruments, and Findings'

    def handle(self, *args, **kwargs):
        self.stdout.write('Membuat data awal jika belum ada...')

        # Units
        units_data = [
            { "id": 1, "kode_unit": "TMP", "nama_unit": "Prodi Teknologi Mekanisasi Pertanian", "jenis_unit": "prodi" },
            { "id": 2, "kode_unit": "TAP", "nama_unit": "Prodi Tata Air Pertanian", "jenis_unit": "prodi" },
            { "id": 3, "kode_unit": "THP", "nama_unit": "Prodi Teknologi Hasil Pertanian", "jenis_unit": "prodi" },
            { "id": 4, "kode_unit": "DIR", "nama_unit": "Direktorat", "jenis_unit": "Manajemen" },
            { "id": 5, "kode_unit": "UPM", "nama_unit": "Unit Penjaminan Mutu", "jenis_unit": "pendukung" },
            { "id": 6, "kode_unit": "AAK", "nama_unit": "Bagian Administrasi Akademik & Kemahasiswaan", "jenis_unit": "pendukung" },
            { "id": 7, "kode_unit": "UMUM", "nama_unit": "Subbagian Umum", "jenis_unit": "pendukung" },
        ]
        units_created = 0
        for data in units_data:
            if not Unit.objects.filter(id=data['id']).exists():
                Unit.objects.create(**data)
                units_created += 1
        self.stdout.write(self.style.SUCCESS(f'{units_created} Unit berhasil dibuat.'))

        # Users - only create if not exist
        users_data = [
            { "id": 1, "nama": "Dr. Ir. Harmanto, M.Eng.", "nip": "harmanto", "role": "Direktur", "unit_id": 4, "password": "pepi123" },
            { "id": 2, "nama": "Dr. Andy Saryoko, S.P., M.P.", "nip": "andy", "role": "Wakil Direktur", "unit_id": 4, "password": "pepi123" },
            { "id": 3, "nama": "Mas Wisnu Aninditya, S.TP., M.Si.", "nip": "wisnu", "role": "Admin UPM", "unit_id": 5, "password": "pepi123" },
            { "id": 10, "nama": "Irwanto, S.Si., M.Pd.", "nip": "irwanto", "role": "Auditor", "unit_id": 3, "assignedUnits": ["TMP", "TAP"], "password": "pepi123" },
            { "id": 12, "nama": "Dr. Mardison S, S.TP., M.Si.", "nip": "mardison", "role": "Auditor", "unit_id": 1, "assignedUnits": ["THP", "TMP"], "password": "pepi123" },
            { "id": 20, "nama": "Dyah Ayu Shofiati (Shofie)", "nip": "shofie", "role": "Admin Prodi", "unit_id": 1, "password": "pepi123" },
            { "id": 21, "nama": "Rivani Yuniar, A.Md.P.", "nip": "rivani", "role": "Admin Prodi", "unit_id": 3, "password": "pepi123" },
            { "id": 22, "nama": "Rifari Satrio Sasongkojati (Satrio)", "nip": "satrio", "role": "Admin Prodi", "unit_id": 2, "password": "pepi123" },
            { "id": 99, "nama": "Super Admin SIAPI", "nip": "superadmin", "role": "Super Admin", "unit_id": 5, "password": "pepi123" },
        ]
        users_created = 0
        for data in users_data:
            if not UserProfile.objects.filter(nip=data['nip']).exists():
                UserProfile.objects.create(**data)
                users_created += 1
        self.stdout.write(self.style.SUCCESS(f'{users_created} User Profile berhasil dibuat.'))

        # Clear and recreate other data
        self.stdout.write('Menghapus data lama untuk QuestionBank, Instrument, Finding...')
        Finding.objects.all().delete()
        Instrument.objects.all().delete()
        QuestionBank.objects.all().delete()

        question_bank_data = [
            # Standar SNDikti (formerly PEPI)
            {"set_type": "sndikti", "standard": "STD-01", "pertanyaan": "Apakah terdapat kebijakan tertulis Rektor/Dekan tentang visi, misi, tujuan dan strategi pencapaian beserta sosialisasinya?", "bukti_wajib": "SK Rektor/Dekan, Dokumen VMTS, Bukti Sosialisasi (Notulen/Daftar Hadir)"},
            {"set_type": "sndikti", "standard": "STD-01", "pertanyaan": "Bagaimana kesesuaian VMTS Prodi dengan VMTS UPPS dan PT? Jelaskan mekanisme penyusunannya.", "bukti_wajib": "Matriks Kesesuaian VMTS, Berita Acara Penyusunan"},
            {"set_type": "sndikti", "standard": "STD-02", "pertanyaan": "Apakah struktur organisasi dan tata pamong program studi terdokumentasi dengan jelas?", "bukti_wajib": "Dokumen Struktur Organisasi, SK Jabatan, Uraian Tugas (Job Description)."},
            # Standar Unggul
            {"set_type": "unggul", "standard": "STD-01", "pertanyaan": "Apakah Program Studi melaksanakan siklus PPEPP (Penetapan, Pelaksanaan, Evaluasi, Pengendalian, dan Peningkatan) secara lengkap dan berkelanjutan pada seluruh aspek akademik dan non-akademik Prodi?", "bukti_wajib": "Manual SPMI Prodi, standar mutu Prodi, laporan PPEPP"},
            {"set_type": "unggul", "standard": "STD-02", "pertanyaan": "Apakah kurikulum Prodi D3 disusun berbasis Outcome-Based Education (OBE) dengan mengacu pada profil lulusan, CPL, dan KKNI/SKKNI?", "bukti_wajib": "Dokumen kurikulum OBE, CPL Prodi"},
            {"set_type": "unggul", "standard": "STD-03", "pertanyaan": "Apakah Prodi memiliki laboratorium/bengkel/alsintan yang mendukung kompetensi inti lulusan D3 enjiniring pertanian?", "bukti_wajib": "SK laboratorium, daftar sarpras"},
            {"set_type": "unggul", "standard": "STD-04", "pertanyaan": "Apakah seluruh mata kuliah memiliki RPS berbasis OBE yang memuat CPL, CPMK, sub-CPMK, metode, dan penilaian?", "bukti_wajib": "RPS OBE"},
            {"set_type": "unggul", "standard": "STD-05", "pertanyaan": "Apakah jumlah dan kualifikasi DTPS memadai dan relevan dengan kebutuhan Prodi D3 vokasi?", "bukti_wajib": "Data DTPS, ijazah, NIDN"},
            {"set_type": "unggul", "standard": "STD-06", "pertanyaan": "Apakah persentase kelulusan tepat masa tempuh atau ≤2x masa studi memenuhi ambang unggul LAM PTIP untuk D3?", "bukti_wajib": "Data kelulusan PD-Dikti"},
            {"set_type": "unggul", "standard": "STD-07", "pertanyaan": "Apakah Prodi memiliki kekhasan/keunggulan vokasi yang membedakan dari Prodi sejenis?", "bukti_wajib": "Dokumen keunggulan Prodi"},
        ]
        for data in question_bank_data:
            QuestionBank.objects.create(**data)
        self.stdout.write(self.style.SUCCESS(f'{len(question_bank_data)} Question Bank berhasil dibuat.'))

        instruments_data = [
            { "id": 1, "standard": "STD-01", "unit_target": "Prodi Teknologi Mekanisasi Pertanian", "pertanyaan": "Apakah program studi memiliki kebijakan tertulis tentang visi, misi, tujuan, dan strategi (VMTS)?", "bukti_wajib": "SK Rektor/Dekan, Dokumen VMTS, Bukti Sosialisasi", "doc_file": None, "auditor_ids": [10, 12], "evaluations": {"10": {"status": "APPROVED", "skor_desk": 4, "isComplete": True, "catatan_desk": "Sangat baik dan selaras dengan VMTS institusi."}, "12": {"status": "APPROVED", "skor_desk": 4, "isComplete": True, "catatan_desk": "Dokumen lengkap dan bukti sosialisasi memadai."}}, "conflict": False, "doc_status": "APPROVED", "skor_desk": 4, "catatan_desk": None, "skor_lapangan": None, "catatan_lapangan": None, "doc_note": None, "skor": 4 },
            { "id": 2, "standard": "STD-06", "unit_target": "Prodi Teknologi Mekanisasi Pertanian", "pertanyaan": "Apakah kurikulum program studi dirancang berbasis OBE (Outcome-Based Education)?", "bukti_wajib": "Dokumen Kurikulum, Laporan Tinjauan Kurikulum", "doc_file": None, "auditor_ids": [10, 12], "evaluations": {"10": {"status": "APPROVED", "skor_desk": 3, "isComplete": True, "catatan_desk": "Cukup baik, namun perlu perbaikan pada rubrik penilaian agar lebih sesuai dengan standar OBE."}, "12": {"status": "APPROVED", "skor_desk": 3, "isComplete": True, "catatan_desk": "Sudah berbasis OBE, tapi implementasi asesmen belum konsisten."}}, "conflict": True, "doc_status": "APPROVED", "skor_desk": 3, "catatan_desk": None, "skor_lapangan": None, "catatan_lapangan": None, "doc_note": None, "skor": 3 },
            { "id": 3, "standard": "STD-04", "unit_target": "Prodi Teknologi Mekanisasi Pertanian", "pertanyaan": "Apakah rasio jumlah dosen tetap terhadap jumlah mahasiswa sudah memadai?", "bukti_wajib": "Data PDDIKTI, Analisis Beban Kerja Dosen", "doc_file": None, "auditor_ids": [10, 12], "evaluations": {"10": {"status": "REJECTED", "skor_desk": 1, "isComplete": True, "catatan_desk": "Rasio tidak sesuai standar minimal, hanya 1:40 padahal syarat 1:30. Bukti terlampir mengkonfirmasi hal ini.", "doc_note": "Rasio Dosen-Mahasiswa tidak memenuhi syarat minimal."}, "12": {"status": "REJECTED", "skor_desk": 2, "isComplete": True, "catatan_desk": "Data rasio tidak sinkron dengan data PDDIKTI. Perlu konfirmasi ulang dan perbaikan segera karena ini temuan major.", "doc_note": "Data rasio perlu disinkronkan dengan PDDIKTI."}}, "conflict": False, "doc_status": "REJECTED", "skor_desk": 1, "catatan_desk": None, "skor_lapangan": None, "catatan_lapangan": None, "doc_note": None, "skor": 1 },
            { "id": 4, "standard": "STD-02", "unit_target": "Prodi Teknologi Mekanisasi Pertanian", "pertanyaan": "Apakah struktur organisasi dan tata pamong program studi terdokumentasi dengan jelas dan telah disosialisasikan?", "bukti_wajib": "Dokumen Struktur Organisasi, SK Jabatan, Uraian Tugas (Job Description)", "doc_file": None, "auditor_ids": [10, 12], "evaluations": {"10": {"status": "APPROVED", "skor_desk": 4, "isComplete": True, "catatan_desk": "Struktur organisasi sudah sesuai dengan pedoman terbaru."}, "12": {"status": "APPROVED", "skor_desk": 4, "isComplete": True, "catatan_desk": "Sangat lengkap."}}, "conflict": False, "doc_status": "APPROVED", "skor_desk": 4, "catatan_desk": None, "skor_lapangan": None, "catatan_lapangan": None, "doc_note": None, "skor": 4 },
            { "id": 5, "standard": "STD-04", "unit_target": "Prodi Tata Air Pertanian", "pertanyaan": "Apakah jumlah dosen tetap memenuhi kebutuhan program studi?", "bukti_wajib": "Data PDDIKTI, Analisis Beban Kerja Dosen", "doc_file": None, "auditor_ids": None, "evaluations": None, "conflict": False, "doc_status": "MISSING", "skor_desk": None, "catatan_desk": None, "skor_lapangan": None, "catatan_lapangan": None, "doc_note": None, "skor": None },
        ]
        created_count = 0
        for data in instruments_data:
            try:
                Instrument.objects.create(**data)
                created_count += 1
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'Gagal membuat Instrument {data.get("id")}: {e}'))
        self.stdout.write(self.style.SUCCESS(f'{created_count} Instrument berhasil dibuat.'))

        findings_data = [
            { "id": 1, "uraian": "Rasio jumlah dosen tetap terhadap jumlah mahasiswa (1:40) pada Prodi Teknologi Mekanisasi Pertanian tidak memenuhi standar minimal yang ditetapkan (1:30), berpotensi mengganggu kualitas bimbingan akademik dan praktikum.", "akar_masalah": "Keterbatasan rekrutmen dosen tetap dan peningkatan jumlah penerimaan mahasiswa yang tidak diimbangi penambahan SDM.", "tindakan_koreksi": "Mengajukan usulan rekrutmen 2 Dosen Tetap baru pada tahun anggaran berikutnya. Melakukan review dan optimalisasi beban mengajar dosen yang ada.", "level_risiko": "TINGGI", "unit": "Prodi Teknologi Mekanisasi Pertanian", "standar": "STD-04", "tipe": "MAJOR", "status_akhir": "Proses RTL", "rencana_tindakan": "Pihak prodi akan mengajukan surat permohonan penambahan Dosen Tetap ke Direktorat pada Q1 2025.", "tanggal_target_rtl": "2025-03-31", "bukti_rtl": None, "catatan_verifikasi": None, "status_verifikasi": "Menunggu", "history": [{"id": 102, "user": "Dyah Ayu Shofiati (Shofie)", "role": "Admin Prodi", "action": "Mengisi Rencana Tindak Lanjut.", "timestamp": "2024-10-01T10:00:00Z"}, {"id": 101, "user": "Irwanto, S.Si., M.Pd.", "role": "Auditor", "action": "Temuan dibuat.", "timestamp": "2024-09-30T15:00:00Z"}] },
            { "id": 2, "uraian": "Struktur organisasi dan tata pamong program studi belum terdokumentasi dengan jelas dan disosialisasikan.", "akar_masalah": None, "tindakan_koreksi": None, "level_risiko": "SEDANG", "unit": "Prodi Tata Air Pertanian", "standar": "STD-02", "tipe": "MINOR", "status_akhir": "Proses RTL", "rencana_tindakan": "Membuat SK Struktur Organisasi dan mengunggahnya di website prodi.", "tanggal_target_rtl": "2024-11-15", "bukti_rtl": None, "catatan_verifikasi": None, "status_verifikasi": "Menunggu", "history": [] },
            { "id": 3, "uraian": "Bukti kegiatan PkM yang melibatkan partisipasi aktif mahasiswa belum terarsip dengan baik.", "akar_masalah": None, "tindakan_koreksi": None, "level_risiko": "RENDAH", "unit": "Prodi Teknologi Hasil Pertanian", "standar": "STD-08", "tipe": "OBS", "status_akhir": "Selesai", "rencana_tindakan": "Membuat folder Google Drive untuk arsip dokumentasi PkM.", "tanggal_target_rtl": "2024-10-20", "bukti_rtl": "Screenshot_GDrive.png", "catatan_verifikasi": "Telah diperiksa dan folder sudah terstruktur dengan baik.", "status_verifikasi": "Sesuai", "history": [] },
        ]
        for data in findings_data:
            Finding.objects.create(**data)
        self.stdout.write(self.style.SUCCESS(f'{len(findings_data)} Finding berhasil dibuat.'))
