
export enum Role {
  SUPER_ADMIN = 'Super Admin',
  ADMIN_UPM = 'Admin UPM', 
  ADMIN_PRODI = 'Admin Prodi', 
  AUDITOR = 'Auditor',
  AUDITEE = 'Auditee', 
  PIMPINAN = 'Direktur',
  WADIR = 'Wakil Direktur',
  KAPRODI = 'Ketua Program Studi'
}

export enum ComplianceStatus {
  PATUH = 'patuh',
  PATUH_BERSYARAT = 'patuh_bersyarat',
  TIDAK_PATUH = 'tidak_patuh'
}

export enum DocumentStatus {
  MISSING = 'Belum Diunggah',
  UPLOADED = 'Menunggu Verifikasi',
  APPROVED = 'Valid / Diterima',
  REJECTED = 'Ditolak / Perlu Revisi'
}

export enum SubmissionStatus {
  PENDING = 'Pending',
  SUBMITTED = 'Terkirim',
  NEED_REVISION = 'Perlu Perbaikan',
  RESUBMITTED = 'Terkirim Ulang',
  APPROVED = 'Disetujui',
  ASSESSED = 'Telah Dinilai',
  DISPUTED = 'Sanggahan',
  AGREED = 'Disepakati',
  FINALIZED = 'Berita Acara Final'
}

export enum FindingType {
  MAJOR = 'major',
  MINOR = 'minor',
  OBS = 'observasi'
}

export enum RiskLevel {
  RENDAH = 'rendah',
  SEDANG = 'sedang',
  TINGGI = 'tinggi'
}

export interface User {
  id: number;
  nama: string;
  nip: string;
  password?: string; 
  role: Role;
  unit_id?: number;
  status: 'aktif' | 'nonaktif';
}

export interface Unit {
  id: number;
  kode_unit: string;
  nama_unit: string;
  jenis_unit: 'prodi' | 'pendukung';
}

export interface Standard {
  id: number;
  kode_standar: string;
  nama_standar: string;
  kategori: string;
}

export interface StandardDocument {
  id: number;
  kategori: 'SPMI_PEPI' | 'SN_DIKTI' | 'BNSP' | 'PD_DIKTI' | 'LAINNYA';
  nama_dokumen: string;
  tahun: string;
  file_url: string;
  uploaded_at: string;
}

export interface AuditorProfile {
  user_id: number;
  nama: string;
  sertifikasi: {
    nama: string;
    penerbit: string;
    file_url: string;
    valid_until: string;
  }[];
  surat_tugas: {
    nomor: string;
    judul: string;
    file_url: string;
    tgl_tugas: string;
  }[];
  pengalaman_audit: number;
  assignment_active?: {
    unit_target: string;
    tanggal_audit: string;
  };
}

export interface LabFacility {
  id: number;
  nama_lab: string;
  luas: number;
  kapasitas: number;
  kondisi: 'Terawat' | 'Rusak Ringan' | 'Rusak Berat';
  kelengkapan_alat: string;
  foto_url?: string;
}

export interface RepositoryDocument {
  id: number;
  kategori: 'RENSTRA' | 'SOP' | 'KURIKULUM' | 'RPS' | 'MODUL' | 'JURNAL' | 'LAINNYA';
  nama_dokumen: string;
  nomor_dokumen?: string;
  tahun: string;
  file_name: string;
  tanggal_upload: string;
}

export interface ProdiTeamMember {
  id: number;
  nama: string;
  jabatan: string; 
  nip: string;
  foto_url?: string;
}

// --- TABEL 2 (Identitas & SDM) ---
export interface CurriculumItem {
  id: number;
  semester: number;
  kode_mk: string;
  nama_mk: string;
  mata_kuliah_kompetensi: boolean; 
  bobot_kuliah: number; 
  bobot_seminar: number; 
  bobot_praktikum: number; 
  konversi_kredit_jam: number;
  capaian_pembelajaran: string;
  bukti_pendukung: string; 
  unit_penyelenggara: string;
}

export interface LecturerProfile {
  id: number;
  nama: string;
  nidn: string; 
  pendidikan_magister: string; 
  pendidikan_doktor: string; 
  bidang_keahlian: string;
  kesesuaian_kompetensi: boolean;
  jabatan_akademik: string; 
  no_sertifikat_pendidik: string;
  sertifikat_kompetensi: string; 
  mata_kuliah_ps: string; 
  kesesuaian_bidang_mk: boolean;
  mata_kuliah_luar_ps: string; 
  bukti_pendukung: string; 
  status_dosen: 'Tetap' | 'Tidak Tetap';
}

export interface IndustryLecturer {
  id: number;
  nama: string;
  nidk: string;
  perusahaan: string;
  pendidikan_tertinggi: string;
  bidang_keahlian: string;
  sertifikat_profesi: string;
  mata_kuliah_diampu: string;
  bobot_sks: number;
}

export interface EducationStaff {
  id: number;
  nama: string;
  nip: string; 
  pendidikan_terakhir: string;
  tugas_pokok: string; 
  sertifikat_kompetensi: string;
}

// --- TABEL 3 (KEUANGAN & PENELITIAN) ---

// Tabel 3.1 Penggunaan Dana
export interface FinancialRecord {
  id: number;
  jenis_penggunaan: string;
  upps_ts2: number; upps_ts1: number; upps_ts: number;
  ps_ts2: number; ps_ts1: number; ps_ts: number;
}

// Tabel 3.2 & 4.1 Statistik Pendanaan (Penelitian & PkM)
export interface FundingStats {
  id: number;
  sumber_pembiayaan: string; // PT / Mandiri / DN / LN
  jumlah_ts2: number;
  jumlah_ts1: number;
  jumlah_ts: number;
  tipe: 'Penelitian' | 'PkM';
}

// Tabel 3.3 & 4.2 Penelitian/PkM Melibatkan Mahasiswa
export interface ActivityWithStudent {
  id: number;
  nama_dosen: string;
  tema_sesuai_roadmap: boolean;
  judul_kegiatan: string;
  nama_mahasiswa: string; // Bisa multiple, dipisah koma
  tahun: string;
  bukti_pendukung: string; // Link
  tipe: 'Penelitian' | 'PkM';
}

// Tabel 3.4 & 3.5 & 4 Luaran (Publikasi, HKI, Buku, Mitra)
export interface PublicationStats {
  id: number;
  jenis_publikasi: string; // Jurnal Nasional, Internasional, dll
  jumlah_ts2: number;
  jumlah_ts1: number;
  jumlah_ts: number;
  kategori: 'Dosen' | 'Mahasiswa'; // Tabel 3.4A vs 3.4B
}

export interface AdditionalOutput {
  id: number;
  judul_luaran: string; // HKI / Teknologi Tepat Guna / Buku
  jenis: string; // Paten/Hak Cipta/Buku ISBN
  tahun: string;
  keterangan: string; // No HKI / ISBN
  bukti_pendukung: string;
}

export interface PartnerPkm {
  id: number;
  nama_dosen: string;
  nama_mitra: string;
  jenis_mitra: 'Desa' | 'UKM' | 'Koperasi' | 'Kelompok' | 'Lainnya';
  keterangan: string; // Detail kegiatan
}

// --- TABEL 5 (ASOSIASI) ---
export interface AssociationMember {
  id: number;
  nama_dosen: string;
  nama_asosiasi: string;
  no_anggota: string;
  tahun_aktif: string;
  bukti_pendukung: string;
}

// --- MAHASISWA ---
export interface GpaStats {
  id: number;
  tahun_lulus: string; 
  jumlah_lulusan: number;
  ipk_min: number;
  ipk_avg: number;
  ipk_max: number;
}

export interface StudentAchievement {
  id: number;
  nama_kegiatan: string;
  waktu_perolehan: string; 
  tingkat: 'Lokal' | 'Nasional' | 'Internasional';
  prestasi: string; 
  bukti_pendukung: string;
}

export interface StudentFlowStats {
  id: number;
  tahun_masuk: string; 
  jumlah_diterima: number;
  jml_lulusan_sd_ts: number;
  rata_masa_studi: string;
}

// NEW: Comprehensive Unit Profile for LED (Laporan Evaluasi Diri)
export interface UnitProfile {
  id: number;
  unit_id: number;
  kode_prodi: string; 
  
  // A. Identitas
  nama_prodi: string;
  jenis_program: string; 
  jumlah_mhs_saat_ts: number; 
  peringkat_akreditasi: string; 
  no_sk_akreditasi: string;
  tgl_kadaluarsa_akreditasi: string;
  bukti_akreditasi: string; 
  
  kelompok_keilmuan: string; 
  nama_unit_pengelola: string; 
  nama_perguruan_tinggi: string;
  alamat_prodi: string;
  kota_kabupaten: string;
  kode_pos: string;
  no_telepon: string;
  email_prodi: string;
  website: string;
  ts_tahun_akademik: string; 
  
  nama_pengusul: string;
  tanggal_pengusulan: string;

  no_sk_pendirian: string;
  tgl_sk_pendirian: string;
  bukti_sk_pendirian: string; 
  no_sk_pembukaan: string;
  bukti_sk_pembukaan: string; 
  
  // B. Pimpinan
  nama_kaprodi: string;
  nidn_kaprodi: string;
  kontak_kaprodi: string;
  foto_kaprodi?: string;

  // C. SDM
  daftar_dosen: LecturerProfile[]; 
  daftar_dosen_industri: IndustryLecturer[];
  daftar_tendik: EducationStaff[];
  daftar_asosiasi: AssociationMember[]; // Tabel 5.1

  // D. Kurikulum
  kurikulum_obe: boolean; 
  daftar_kurikulum: CurriculumItem[];
  
  // E. Keuangan & Sarpras
  tabel_keuangan: FinancialRecord[]; // Tabel 3.1
  daftar_laboratorium: LabFacility[];

  // F. Riset & PkM & Luaran
  statistik_pendanaan: FundingStats[]; // Tabel 3.2 & 4.1
  kegiatan_mahasiswa: ActivityWithStudent[]; // Tabel 3.3 & 4.2
  statistik_publikasi: PublicationStats[]; // Tabel 3.4A & 3.4B
  luaran_lainnya: AdditionalOutput[]; // Tabel 3.4E, 3.5, Buku
  mitra_pkm: PartnerPkm[]; // Tabel 4.3

  // G. Mahasiswa & Luaran
  statistik_ipk: GpaStats[];
  prestasi_mhs: StudentAchievement[];
  arus_mahasiswa: StudentFlowStats[];
  
  waktu_tunggu_lulusan: number; 
  kesesuaian_bidang_kerja: number; 
  tingkat_kepuasan_pengguna: number; 
  link_laporan_tracer?: string; 
}

export interface ChatMessage {
  id: number;
  senderName: string;
  senderRole: Role;
  message: string;
  timestamp: string;
  isSelf: boolean;
}

export interface ChatTopic {
  id: number;
  title: string;
  unit: string;
  lastMessage: string;
  unreadCount: number;
  updatedAt: string;
  messages: ChatMessage[];
}

export interface HeroSlide {
  id: number;
  image: string;
  title: string;
  subtitle: string;
}
