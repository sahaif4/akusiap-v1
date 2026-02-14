
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Building2, Users, Save, Edit, ChevronDown, Plus, Trash2, 
  BookOpen, Search, Download, Link as LinkIcon, Landmark, GraduationCap, Briefcase, FileText, CheckCircle2, AlertTriangle, X, Wallet, Microscope, Share2
} from 'lucide-react';
import { UnitProfile, Role, FinancialRecord, FundingStats, ActivityWithStudent, PublicationStats, AdditionalOutput, PartnerPkm, AssociationMember } from '../types';

const STORAGE_KEYS = { PROFILES: 'siapepi_prodi_profiles_v11_fixed_final' };

// --- INITIAL DATA: 3 PRODI LENGKAP (DENGAN FIELD BARU KOSONG) ---
const INITIAL_PROFILES: UnitProfile[] = [
  // 1. TMP
  {
    id: 1, unit_id: 1, kode_prodi: 'TMP', 
    nama_prodi: 'Teknologi Mekanisasi Pertanian', jenis_program: 'Diploma Tiga', jumlah_mhs_saat_ts: 245,
    peringkat_akreditasi: 'Baik Sekali', no_sk_akreditasi: 'SK-LAMPT/2023/105', tgl_kadaluarsa_akreditasi: '2028-10-15', bukti_akreditasi: '',
    kelompok_keilmuan: 'Saintek', nama_unit_pengelola: 'Jurusan Pertanian', nama_perguruan_tinggi: 'Politeknik Enjiniring Pertanian Indonesia',
    alamat_prodi: 'Jalan Sinarmas Boulevard', kota_kabupaten: 'Tangerang', kode_pos: '15338', no_telepon: '021-12345678', email_prodi: 'tmp@pepi.ac.id', website: 'https://pepi.ac.id/tmp', ts_tahun_akademik: '2024/2025',
    nama_pengusul: 'Ir. Athoillah Azadi, S.TP, MT', tanggal_pengusulan: new Date().toISOString().split('T')[0],
    no_sk_pendirian: 'SK-KEMENTAN/2019/001', tgl_sk_pendirian: '2019-09-25', bukti_sk_pendirian: '',
    no_sk_pembukaan: 'SK-DIKTI/2019/055', bukti_sk_pembukaan: '',
    nama_kaprodi: 'Ir. Athoillah Azadi, S.TP, MT', nidn_kaprodi: '0012128501', kontak_kaprodi: '0812-3456-7890',
    
    daftar_dosen: [
       { id: 1, status_dosen: 'Tetap', nama: 'Ir. Athoillah Azadi, S.TP, MT', nidn: '0012128501', pendidikan_magister: 'Teknik Pertanian', pendidikan_doktor: '', bidang_keahlian: 'Mekanisasi', kesesuaian_kompetensi: true, jabatan_akademik: 'Lektor Kepala', no_sertifikat_pendidik: '12345', sertifikat_kompetensi: 'Ahli K3', mata_kuliah_ps: 'Termodinamika', kesesuaian_bidang_mk: true, mata_kuliah_luar_ps: '-', bukti_pendukung: '' }
    ],
    daftar_dosen_industri: [], daftar_tendik: [], daftar_asosiasi: [],
    kurikulum_obe: true, 
    daftar_kurikulum: [
      { id: 1, semester: 1, kode_mk: 'TMP101', nama_mk: 'Menggambar Teknik', mata_kuliah_kompetensi: true, bobot_kuliah: 1, bobot_seminar: 0, bobot_praktikum: 2, konversi_kredit_jam: 5.4, capaian_pembelajaran: 'Mampu menggambar 2D/3D', unit_penyelenggara: 'Prodi TMP', bukti_pendukung: 'https://drive.google.com/file/d/rps-gambar-teknik' },
      { id: 2, semester: 1, kode_mk: 'TMP107', nama_mk: 'Elemen Mesin', mata_kuliah_kompetensi: true, bobot_kuliah: 1, bobot_seminar: 0, bobot_praktikum: 1, konversi_kredit_jam: 3.4, capaian_pembelajaran: 'Mata kuliah ini membahas konsep dasar perancangan elemen mesin.', unit_penyelenggara: 'Prodi TMP', bukti_pendukung: '' }
    ],
    
    // NEW DATA STRUCTURES
    tabel_keuangan: [
        { id: 1, jenis_penggunaan: 'Biaya Operasional Pendidikan (Dosen/Tendik)', upps_ts2: 500000000, upps_ts1: 550000000, upps_ts: 600000000, ps_ts2: 150000000, ps_ts1: 160000000, ps_ts: 170000000 },
        { id: 2, jenis_penggunaan: 'Biaya Penelitian', upps_ts2: 100000000, upps_ts1: 120000000, upps_ts: 150000000, ps_ts2: 30000000, ps_ts1: 40000000, ps_ts: 50000000 },
        { id: 3, jenis_penggunaan: 'Biaya PkM', upps_ts2: 50000000, upps_ts1: 60000000, upps_ts: 70000000, ps_ts2: 15000000, ps_ts1: 20000000, ps_ts: 25000000 },
    ],
    statistik_pendanaan: [
        { id: 1, tipe: 'Penelitian', sumber_pembiayaan: 'Perguruan Tinggi', jumlah_ts2: 2, jumlah_ts1: 3, jumlah_ts: 4 },
        { id: 2, tipe: 'PkM', sumber_pembiayaan: 'Mandiri', jumlah_ts2: 1, jumlah_ts1: 1, jumlah_ts: 2 },
    ],
    kegiatan_mahasiswa: [],
    statistik_publikasi: [
        { id: 1, kategori: 'Dosen', jenis_publikasi: 'Jurnal Nasional Terakreditasi', jumlah_ts2: 2, jumlah_ts1: 4, jumlah_ts: 5 },
    ],
    luaran_lainnya: [], mitra_pkm: [], daftar_laboratorium: [],

    statistik_ipk: [{ id: 1, tahun_lulus: 'TS-1', jumlah_lulusan: 48, ipk_min: 3.00, ipk_avg: 3.52, ipk_max: 3.95 }],
    prestasi_mhs: [], arus_mahasiswa: [], waktu_tunggu_lulusan: 3.5, kesesuaian_bidang_kerja: 78, tingkat_kepuasan_pengguna: 88
  },
  { id: 2, unit_id: 2, kode_prodi: 'TAP', nama_prodi: 'Tata Air Pertanian', jenis_program: 'Diploma Tiga', jumlah_mhs_saat_ts: 180, peringkat_akreditasi: 'Baik', no_sk_akreditasi: 'SK-LAMPT/2023/106', tgl_kadaluarsa_akreditasi: '2028-11-20', bukti_akreditasi: '', kelompok_keilmuan: 'Saintek', nama_unit_pengelola: 'Jurusan Pertanian', nama_perguruan_tinggi: 'Politeknik Enjiniring Pertanian Indonesia', alamat_prodi: 'Jalan Sinarmas Boulevard', kota_kabupaten: 'Tangerang', kode_pos: '15338', no_telepon: '021-12345678', email_prodi: 'tap@pepi.ac.id', website: 'https://pepi.ac.id/tap', ts_tahun_akademik: '2024/2025', nama_pengusul: 'Dr. Ir. Rahmat Hanif, M.Eng', tanggal_pengusulan: new Date().toISOString().split('T')[0], no_sk_pendirian: 'SK-KEMENTAN/2019/002', tgl_sk_pendirian: '2019-09-25', bukti_sk_pendirian: '', no_sk_pembukaan: 'SK-DIKTI/2019/056', bukti_sk_pembukaan: '', nama_kaprodi: 'Dr. Ir. Rahmat Hanif, M.Eng', nidn_kaprodi: '0011223344', kontak_kaprodi: '0813-9988-7766', daftar_dosen: [], daftar_dosen_industri: [], daftar_tendik: [], daftar_asosiasi: [], kurikulum_obe: true, daftar_kurikulum: [], tabel_keuangan: [], statistik_pendanaan: [], kegiatan_mahasiswa: [], statistik_publikasi: [], luaran_lainnya: [], mitra_pkm: [], daftar_laboratorium: [], statistik_ipk: [], prestasi_mhs: [], arus_mahasiswa: [], waktu_tunggu_lulusan: 4.0, kesesuaian_bidang_kerja: 70, tingkat_kepuasan_pengguna: 85 },
  { id: 3, unit_id: 3, kode_prodi: 'THP', nama_prodi: 'Teknologi Hasil Pertanian', jenis_program: 'Diploma Tiga', jumlah_mhs_saat_ts: 210, peringkat_akreditasi: 'Baik Sekali', no_sk_akreditasi: 'SK-LAMPT/2023/107', tgl_kadaluarsa_akreditasi: '2028-12-05', bukti_akreditasi: '', kelompok_keilmuan: 'Saintek', nama_unit_pengelola: 'Jurusan Pertanian', nama_perguruan_tinggi: 'Politeknik Enjiniring Pertanian Indonesia', alamat_prodi: 'Jalan Sinarmas Boulevard', kota_kabupaten: 'Tangerang', kode_pos: '15338', no_telepon: '021-12345678', email_prodi: 'thp@pepi.ac.id', website: 'https://pepi.ac.id/thp', ts_tahun_akademik: '2024/2025', nama_pengusul: 'Dr. Mona Nur Moulia, S.TP, M.Sc', tanggal_pengusulan: new Date().toISOString().split('T')[0], no_sk_pendirian: 'SK-KEMENTAN/2019/003', tgl_sk_pendirian: '2019-09-25', bukti_sk_pendirian: '', no_sk_pembukaan: 'SK-DIKTI/2019/057', bukti_sk_pembukaan: '', nama_kaprodi: 'Dr. Mona Nur Moulia, S.TP, M.Sc', nidn_kaprodi: '0055667788', kontak_kaprodi: '0815-1122-3344', daftar_dosen: [], daftar_dosen_industri: [], daftar_tendik: [], daftar_asosiasi: [], kurikulum_obe: true, daftar_kurikulum: [], tabel_keuangan: [], statistik_pendanaan: [], kegiatan_mahasiswa: [], statistik_publikasi: [], luaran_lainnya: [], mitra_pkm: [], daftar_laboratorium: [], statistik_ipk: [], prestasi_mhs: [], arus_mahasiswa: [], waktu_tunggu_lulusan: 3.0, kesesuaian_bidang_kerja: 82, tingkat_kepuasan_pengguna: 90 }
];

interface ProdiProfileViewProps {
  userRole?: Role;
  userUnit?: string;
}

const TableHeader = ({ children }: { children?: React.ReactNode }) => (
  <thead className="bg-slate-100 border-b-2 border-slate-200 text-[10px] font-black uppercase text-slate-600 text-center tracking-wider">
    {children}
  </thead>
);

const ProdiProfileView: React.FC<ProdiProfileViewProps> = ({ userRole, userUnit }) => {
  const [profiles, setProfiles] = useState<UnitProfile[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PROFILES);
    return saved ? JSON.parse(saved) : INITIAL_PROFILES;
  });

  useEffect(() => {
    if (profiles.length === 0) setProfiles(INITIAL_PROFILES);
  }, [profiles]);

  const canEdit = [Role.ADMIN_PRODI, Role.KAPRODI, Role.SUPER_ADMIN].includes(userRole as Role);
  const isRestrictedView = [Role.ADMIN_PRODI, Role.KAPRODI, Role.AUDITEE].includes(userRole as Role);

  const availableProfiles = useMemo(() => {
    if (isRestrictedView && userUnit) {
      return profiles.filter(p => userUnit.includes(p.nama_prodi) || userUnit.includes(p.kode_prodi) || p.nama_prodi.includes(userUnit));
    }
    return profiles;
  }, [profiles, userRole, userUnit]);

  const [activeProfileId, setActiveProfileId] = useState(availableProfiles[0]?.id || 1);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'identitas' | 'sdm' | 'keuangan' | 'kurikulum' | 'riset' | 'mahasiswa'>('identitas');
  const [isSaving, setIsSaving] = useState(false);

  // --- MODAL STATE ---
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    type: string; // 'dosen', 'mk', 'kegiatan_mhs', 'luaran', 'mitra', 'asosiasi'
    data: any;
  }>({ isOpen: false, type: '', data: null });

  useEffect(() => { localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(profiles)); }, [profiles]);
  
  const profile = profiles.find(p => p.id === activeProfileId) || profiles[0];

  const handleUpdate = (field: keyof UnitProfile, value: any) => {
    setProfiles(prev => prev.map(p => p.id === activeProfileId ? { ...p, [field]: value } : p));
  };

  const handleArrayUpdate = (field: keyof UnitProfile, updatedArray: any[]) => {
    handleUpdate(field, updatedArray);
  };

  const removeItem = (field: keyof UnitProfile, id: number) => {
    if(confirm('Hapus baris data ini?')) {
        const currentArray = (profile[field] as any[]) || [];
        handleArrayUpdate(field, currentArray.filter(item => item.id !== id));
    }
  };

  // --- GENERIC MODAL HANDLER ---
  const openModal = (type: string, data: any = null) => {
    setModalConfig({ 
      isOpen: true, 
      type, 
      data: data ? { ...data } : { id: Date.now() } // New item gets new ID
    });
  };

  const handleSaveModal = (formData: any) => {
    const fieldMap: Record<string, keyof UnitProfile> = {
      'dosen': 'daftar_dosen',
      'dosen_industri': 'daftar_dosen_industri',
      'tendik': 'daftar_tendik',
      'mk': 'daftar_kurikulum',
      'kegiatan_mhs': 'kegiatan_mahasiswa',
      'luaran': 'luaran_lainnya',
      'mitra': 'mitra_pkm',
      'asosiasi': 'daftar_asosiasi',
      'keuangan': 'tabel_keuangan', 
      'pendanaan': 'statistik_pendanaan',
      'publikasi': 'statistik_publikasi',
      'prestasi': 'prestasi_mhs',
      'ipk': 'statistik_ipk'
    };

    const targetField = fieldMap[modalConfig.type];
    const currentArray = (profile[targetField] as any[]) || [];
    
    // FIX: Gunakan merging object agar field yang tidak ada di form (seperti id lama) tidak hilang
    const existingIndex = currentArray.findIndex(item => item.id === formData.id);
    let newArray;
    if (existingIndex >= 0) {
      newArray = [...currentArray];
      // PENTING: Merge data lama dengan data baru
      newArray[existingIndex] = { ...newArray[existingIndex], ...formData };
    } else {
      newArray = [...currentArray, formData];
    }

    handleArrayUpdate(targetField, newArray);
    setModalConfig({ ...modalConfig, isOpen: false });
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => { setIsSaving(false); setIsEditing(false); }, 800);
  };

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-500">
      
      {/* HEADER CONTROL */}
      <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6 sticky top-0 z-40">
         <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="p-3 bg-emerald-600 text-white rounded-2xl shadow-lg shadow-emerald-100"><Landmark size={24}/></div>
            <div>
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Profil Program Studi (LED)</label>
               <select 
                  value={activeProfileId} 
                  onChange={(e) => setActiveProfileId(parseInt(e.target.value))}
                  disabled={isRestrictedView}
                  className="bg-transparent text-lg font-black text-slate-900 outline-none cursor-pointer w-full md:w-auto"
               >
                  {availableProfiles.map(p => <option key={p.id} value={p.id}>{p.nama_prodi}</option>)}
               </select>
            </div>
         </div>
         <div className="flex gap-3">
            {canEdit && (
               <button onClick={() => isEditing ? handleSave() : setIsEditing(true)} className={`px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg flex items-center gap-2 transition-all ${isEditing ? 'bg-emerald-500 text-white hover:bg-emerald-600' : 'bg-slate-900 text-white hover:bg-indigo-600'}`}>
                  {isEditing ? (isSaving ? 'Menyimpan...' : <><Save size={16}/> Simpan Data</>) : <><Edit size={16}/> Mode Edit</>}
               </button>
            )}
            <button className="px-4 py-3 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200"><Download size={18}/></button>
         </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex flex-wrap justify-center md:justify-start bg-white p-1 rounded-2xl w-fit shadow-sm border border-slate-200 mx-auto md:mx-0 gap-1 overflow-x-auto">
         {[
            { id: 'identitas', label: '1. Identitas', icon: Building2 },
            { id: 'sdm', label: '2. SDM & Asosiasi', icon: Users },
            { id: 'keuangan', label: '3. Keuangan & Sarpras', icon: Wallet },
            { id: 'kurikulum', label: '4. Kurikulum', icon: BookOpen },
            { id: 'riset', label: '5. Riset, PkM & Luaran', icon: Microscope },
            { id: 'mahasiswa', label: '6. Mahasiswa', icon: GraduationCap },
         ].map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id as any)} className={`flex items-center gap-2 px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === t.id ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}>
               <t.icon size={14}/> {t.label}
            </button>
         ))}
      </div>

      <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm min-h-[600px] overflow-hidden relative">
         
         {/* TAB 1: IDENTITAS */}
         {activeTab === 'identitas' && (
            <div className="space-y-8 animate-in slide-in-from-right-4">
               {/* HEAD OF PRODI CARD */}
               <div className="flex items-center gap-6 p-6 bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl text-white shadow-lg">
                  <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center text-2xl font-bold border-2 border-white/20">
                     {profile.nama_kaprodi.charAt(0)}
                  </div>
                  <div className="flex-1">
                     <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-1">Ketua Program Studi</p>
                     {isEditing ? <input value={profile.nama_kaprodi} onChange={(e) => handleUpdate('nama_kaprodi', e.target.value)} className="bg-white/10 border border-white/20 p-2 rounded text-lg font-bold w-full text-white"/> : <h3 className="text-xl font-bold">{profile.nama_kaprodi}</h3>}
                     <div className="flex gap-4 mt-2 text-xs text-slate-400">
                        <span>NIDN: {isEditing ? <input value={profile.nidn_kaprodi} onChange={(e) => handleUpdate('nidn_kaprodi', e.target.value)} className="bg-black/20 p-1 rounded w-24 text-white"/> : profile.nidn_kaprodi}</span>
                        <span>Kontak: {isEditing ? <input value={profile.kontak_kaprodi} onChange={(e) => handleUpdate('kontak_kaprodi', e.target.value)} className="bg-black/20 p-1 rounded w-32 text-white"/> : profile.kontak_kaprodi}</span>
                     </div>
                  </div>
               </div>

               {/* TABEL 1 IDENTITAS */}
               <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6 border-b border-slate-200 pb-2 flex items-center gap-2">
                     <FileText size={16}/> Tabel 1. Identitas Program Studi
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 text-sm">
                     {[
                        { l: 'Nama Program Studi', k: 'nama_prodi' },
                        { l: 'Jenis Program', k: 'jenis_program', type: 'select', opts: ['Diploma Tiga','Sarjana Terapan'] },
                        { l: 'Peringkat Akreditasi', k: 'peringkat_akreditasi' },
                        { l: 'No. SK Akreditasi', k: 'no_sk_akreditasi' },
                        { l: 'Tanggal Kadaluarsa', k: 'tgl_kadaluarsa_akreditasi', type: 'date' },
                        { l: 'Jumlah Mahasiswa saat TS', k: 'jumlah_mhs_saat_ts', type: 'number' },
                        { l: 'Nama Unit Pengelola', k: 'nama_unit_pengelola' },
                        { l: 'Nama Perguruan Tinggi', k: 'nama_perguruan_tinggi' },
                        { l: 'Alamat', k: 'alamat_prodi' },
                        { l: 'No. SK Pendirian PT', k: 'no_sk_pendirian' },
                        { l: 'Tanggal SK Pendirian', k: 'tgl_sk_pendirian', type: 'date' },
                        { l: 'No. SK Pembukaan PS', k: 'no_sk_pembukaan' },
                        { l: 'Nama Pengusul', k: 'nama_pengusul' },
                        { l: 'Tanggal Pengusulan', k: 'tanggal_pengusulan', type: 'date' },
                     ].map((field, idx) => (
                        <div key={idx}>
                           <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">{field.l}</label>
                           {isEditing ? (
                              field.type === 'select' ? (
                                 <select value={(profile as any)[field.k]} onChange={(e) => handleUpdate(field.k as any, e.target.value)} className="w-full border-b-2 border-slate-300 bg-transparent py-1 font-bold outline-none focus:border-indigo-500">
                                    {field.opts?.map(o => <option key={o} value={o}>{o}</option>)}
                                 </select>
                              ) : <input type={field.type || 'text'} value={(profile as any)[field.k]} onChange={(e) => handleUpdate(field.k as any, e.target.value)} className="w-full border-b-2 border-slate-300 bg-transparent py-1 font-bold outline-none focus:border-indigo-500" />
                           ) : <p className="font-bold text-slate-800 border-b border-transparent py-1">{(profile as any)[field.k]}</p>}
                        </div>
                     ))}
                  </div>
               </div>
            </div>
         )}

         {/* TAB 2: SDM & ASOSIASI */}
         {activeTab === 'sdm' && (
            <div className="space-y-10 animate-in slide-in-from-right-4">
               {/* 2.1A DOSEN TETAP */}
               <div className="space-y-4">
                  <div className="flex justify-between items-center bg-indigo-50 p-4 rounded-2xl border border-indigo-100">
                     <h3 className="text-sm font-black text-indigo-900 uppercase tracking-widest">Tabel 2.1A Dosen Tetap Perguruan Tinggi</h3>
                     {isEditing && <button onClick={() => openModal('dosen')} className="px-3 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-bold shadow-lg hover:bg-indigo-700 flex items-center gap-2"><Plus size={14}/> Tambah Dosen</button>}
                  </div>
                  <div className="overflow-x-auto border border-slate-200 rounded-xl shadow-sm">
                     <table className="w-full text-xs text-left whitespace-nowrap">
                        <TableHeader>
                           <tr><th className="p-3">No</th><th className="p-3">Nama</th><th className="p-3">NIDN</th><th className="p-3">Jabatan</th><th className="p-3">Bidang Keahlian</th><th className="p-3">Bukti</th>{isEditing && <th className="p-3 bg-slate-200">Aksi</th>}</tr>
                        </TableHeader>
                        <tbody className="divide-y divide-slate-100">
                           {profile.daftar_dosen.filter(d => d.status_dosen === 'Tetap').map((d, i) => (
                              <tr key={d.id} className="hover:bg-slate-50">
                                 <td className="p-3 text-center">{i + 1}</td>
                                 <td className="p-3 font-bold">{d.nama}</td>
                                 <td className="p-3">{d.nidn}</td>
                                 <td className="p-3">{d.jabatan_akademik}</td>
                                 <td className="p-3">{d.bidang_keahlian}</td>
                                 <td className="p-3 text-center">
                                    {d.bukti_pendukung ? (
                                       <a href={d.bukti_pendukung} target="_blank" rel="noreferrer" className="text-indigo-600 underline font-bold flex items-center gap-1 justify-center"><LinkIcon size={12}/> Link</a>
                                    ) : <span className="text-slate-300">-</span>}
                                 </td>
                                 {isEditing && <td className="p-3 text-center"><button onClick={() => openModal('dosen', d)} className="text-indigo-600 mr-2"><Edit size={14}/></button><button onClick={() => removeItem('daftar_dosen', d.id)} className="text-rose-500"><Trash2 size={14}/></button></td>}
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
               </div>

               {/* 5.1 ASOSIASI */}
               <div className="space-y-4">
                  <div className="flex justify-between items-center bg-slate-100 p-4 rounded-2xl border border-slate-200">
                     <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Tabel 5.1 Anggota Asosiasi Profesi</h3>
                     {isEditing && <button onClick={() => openModal('asosiasi')} className="px-3 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-bold shadow-lg flex items-center gap-2"><Plus size={14}/> Tambah</button>}
                  </div>
                  <div className="overflow-x-auto border border-slate-200 rounded-xl shadow-sm">
                     <table className="w-full text-xs text-left">
                        <TableHeader><tr><th className="p-3">No</th><th className="p-3">Nama Dosen</th><th className="p-3">Nama Asosiasi</th><th className="p-3">No Anggota</th><th className="p-3">Bukti</th>{isEditing && <th className="p-3">Aksi</th>}</tr></TableHeader>
                        <tbody className="divide-y divide-slate-100">
                           {profile.daftar_asosiasi.map((a, i) => (
                              <tr key={a.id}>
                                 <td className="p-3 text-center">{i+1}</td>
                                 <td className="p-3 font-bold">{a.nama_dosen}</td>
                                 <td className="p-3">{a.nama_asosiasi}</td>
                                 <td className="p-3">{a.no_anggota}</td>
                                 <td className="p-3 text-indigo-600 underline cursor-pointer">Lihat</td>
                                 {isEditing && <td className="p-3"><button onClick={() => removeItem('daftar_asosiasi', a.id)}><Trash2 size={14}/></button></td>}
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
               </div>
            </div>
         )}

         {/* TAB 3: KEUANGAN (NEW) */}
         {activeTab === 'keuangan' && (
            <div className="space-y-8 animate-in slide-in-from-right-4">
               {/* 3.1 PENGGUNAAN DANA */}
               <div className="space-y-4">
                  <div className="flex justify-between items-center bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
                     <h3 className="text-sm font-black text-emerald-900 uppercase tracking-widest">Tabel 3.1 Penggunaan Dana</h3>
                     {isEditing && <button onClick={() => openModal('keuangan')} className="px-3 py-2 bg-emerald-600 text-white rounded-xl text-[10px] font-bold shadow-lg flex items-center gap-2"><Plus size={14}/> Tambah Pos Biaya</button>}
                  </div>
                  <div className="overflow-x-auto border border-slate-200 rounded-xl shadow-sm">
                     <table className="w-full text-xs text-left">
                        <thead className="bg-slate-100 border-b-2 border-slate-200 text-[10px] font-black uppercase text-slate-600 text-center">
                           <tr>
                              <th rowSpan={2} className="p-3 border-r">No</th>
                              <th rowSpan={2} className="p-3 border-r">Jenis Penggunaan</th>
                              <th colSpan={3} className="p-3 border-r border-b">Unit Pengelola (UPPS)</th>
                              <th colSpan={3} className="p-3 border-b">Program Studi (PS)</th>
                              {isEditing && <th rowSpan={2} className="p-3 bg-slate-200">Aksi</th>}
                           </tr>
                           <tr>
                              <th className="p-2 border-r bg-emerald-50">TS-2</th>
                              <th className="p-2 border-r bg-emerald-50">TS-1</th>
                              <th className="p-2 border-r bg-emerald-50">TS</th>
                              <th className="p-2 bg-blue-50">TS-2</th>
                              <th className="p-2 bg-blue-50">TS-1</th>
                              <th className="p-2 bg-blue-50">TS</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-right">
                           {profile.tabel_keuangan.map((k, i) => (
                              <tr key={k.id} className="hover:bg-slate-50">
                                 <td className="p-3 text-center text-slate-500">{i+1}</td>
                                 <td className="p-3 text-left font-bold text-slate-700">{k.jenis_penggunaan}</td>
                                 <td className="p-3 bg-emerald-50/30">{k.upps_ts2.toLocaleString()}</td>
                                 <td className="p-3 bg-emerald-50/30">{k.upps_ts1.toLocaleString()}</td>
                                 <td className="p-3 bg-emerald-50/30 font-bold">{k.upps_ts.toLocaleString()}</td>
                                 <td className="p-3 bg-blue-50/30">{k.ps_ts2.toLocaleString()}</td>
                                 <td className="p-3 bg-blue-50/30">{k.ps_ts1.toLocaleString()}</td>
                                 <td className="p-3 bg-blue-50/30 font-bold">{k.ps_ts.toLocaleString()}</td>
                                 {isEditing && <td className="p-3 text-center flex items-center justify-center gap-2">
                                    <button onClick={() => openModal('keuangan', k)} className="text-indigo-600"><Edit size={14}/></button>
                                    <button onClick={() => removeItem('tabel_keuangan', k.id)} className="text-rose-500"><Trash2 size={14}/></button>
                                 </td>}
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
               </div>
            </div>
         )}

         {/* TAB 4: KURIKULUM */}
         {activeTab === 'kurikulum' && (
            <div className="space-y-6 animate-in slide-in-from-right-4">
               <div className="flex justify-between items-center bg-indigo-50 p-4 rounded-2xl border border-indigo-100">
                  <h3 className="text-sm font-black text-indigo-900 uppercase tracking-widest">Tabel 2. Kurikulum & Pembelajaran</h3>
                  {isEditing && <button onClick={() => openModal('mk')} className="px-3 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-bold shadow-lg hover:bg-indigo-700 flex items-center gap-2"><Plus size={14}/> Tambah Mata Kuliah</button>}
               </div>
               
               <div className="overflow-x-auto border border-slate-200 rounded-xl shadow-sm">
                  <table className="w-full text-xs text-left whitespace-nowrap">
                     <thead className="bg-slate-100 border-b-2 border-slate-200 text-[10px] font-black uppercase text-slate-600 text-center">
                        <tr>
                           <th rowSpan={2} className="p-3 border-r">No</th>
                           <th rowSpan={2} className="p-3 border-r">Kode MK</th>
                           <th rowSpan={2} className="p-3 border-r">Nama Mata Kuliah</th>
                           <th colSpan={3} className="p-3 border-r border-b">Bobot Kredit (SKS)</th>
                           <th rowSpan={2} className="p-3 border-r">Capaian Pembelajaran</th>
                           <th rowSpan={2} className="p-3 border-r">Bukti (Link)</th>
                           <th rowSpan={2} className="p-3 border-r">Unit Penyelenggara</th>
                           {isEditing && <th rowSpan={2} className="p-3 bg-slate-200">Aksi</th>}
                        </tr>
                        <tr>
                           <th className="p-2 border-r bg-slate-50">Kuliah</th>
                           <th className="p-2 border-r bg-slate-50">Seminar</th>
                           <th className="p-2 bg-slate-50">Praktik</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-100">
                        {profile.daftar_kurikulum.map((k, i) => (
                           <tr key={k.id} className="hover:bg-slate-50">
                              <td className="p-3 text-center">{i + 1}</td>
                              <td className="p-3 font-mono text-center">{k.kode_mk}</td>
                              <td className="p-3 font-bold">{k.nama_mk}</td>
                              <td className="p-3 text-center">{k.bobot_kuliah}</td>
                              <td className="p-3 text-center">{k.bobot_seminar}</td>
                              <td className="p-3 text-center">{k.bobot_praktikum}</td>
                              <td className="p-3 truncate max-w-xs">{k.capaian_pembelajaran}</td>
                              <td className="p-3 text-center">
                                {k.bukti_pendukung ? (
                                  <a href={k.bukti_pendukung} target="_blank" rel="noreferrer" className="text-indigo-600 underline font-bold flex items-center gap-1 justify-center">
                                    <LinkIcon size={12}/> RPS
                                  </a>
                                ) : (
                                  <span className="text-slate-300">-</span>
                                )}
                              </td>
                              <td className="p-3">{k.unit_penyelenggara}</td>
                              {isEditing && <td className="p-3 text-center"><button onClick={() => openModal('mk', k)} className="text-indigo-600 mr-2"><Edit size={14}/></button><button onClick={() => removeItem('daftar_kurikulum', k.id)} className="text-rose-500"><Trash2 size={14}/></button></td>}
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </div>
         )}

         {/* TAB 5: RISET & LUARAN (NEW) */}
         {activeTab === 'riset' && (
            <div className="space-y-12 animate-in slide-in-from-right-4">
               {/* 3.3 PENELITIAN MAHASISWA */}
               <div className="space-y-4">
                  <div className="flex justify-between items-center bg-slate-100 p-4 rounded-2xl border border-slate-200">
                     <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Tabel 3.3 & 4.2 Penelitian/PkM Melibatkan Mahasiswa</h3>
                     {isEditing && <button onClick={() => openModal('kegiatan_mhs')} className="px-3 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-bold shadow-lg flex items-center gap-2"><Plus size={14}/> Tambah</button>}
                  </div>
                  <div className="overflow-x-auto border border-slate-200 rounded-xl shadow-sm">
                     <table className="w-full text-xs text-left">
                        <TableHeader><tr><th className="p-3">No</th><th className="p-3">Judul Kegiatan</th><th className="p-3">Nama Dosen</th><th className="p-3">Nama Mahasiswa</th><th className="p-3">Tahun</th><th className="p-3">Bukti</th><th className="p-3">Roadmap</th>{isEditing && <th className="p-3">Aksi</th>}</tr></TableHeader>
                        <tbody className="divide-y divide-slate-100">
                           {profile.kegiatan_mahasiswa.map((k, i) => (
                              <tr key={k.id}>
                                 <td className="p-3 text-center">{i+1}</td>
                                 <td className="p-3 font-bold">{k.judul_kegiatan} <span className="text-[9px] bg-slate-200 px-1 rounded ml-1">{k.tipe}</span></td>
                                 <td className="p-3">{k.nama_dosen}</td>
                                 <td className="p-3">{k.nama_mahasiswa}</td>
                                 <td className="p-3 text-center">{k.tahun}</td>
                                 <td className="p-3 text-center">
                                    {k.bukti_pendukung ? (
                                       <a href={k.bukti_pendukung} target="_blank" rel="noreferrer" className="text-indigo-600 underline font-bold flex items-center gap-1 justify-center"><LinkIcon size={12}/> Link</a>
                                    ) : <span className="text-slate-300">-</span>}
                                 </td>
                                 <td className="p-3 text-center">{k.tema_sesuai_roadmap ? '✅' : '❌'}</td>
                                 {isEditing && <td className="p-3 text-center"><button onClick={() => removeItem('kegiatan_mahasiswa', k.id)}><Trash2 size={14} className="text-rose-500"/></button></td>}
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
               </div>

               {/* 3.5 & 4.3 LUARAN LAINNYA & MITRA */}
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-4">
                     <div className="flex justify-between items-center border-b pb-2">
                        <h3 className="font-bold text-slate-800 text-sm">Tabel 3.5 Luaran Lain (HKI/Buku/Teknologi)</h3>
                        {isEditing && <button onClick={() => openModal('luaran')} className="text-indigo-600 text-xs font-bold">+ Add</button>}
                     </div>
                     <div className="bg-slate-50 rounded-xl p-4 min-h-[100px] border border-slate-200">
                        {profile.luaran_lainnya.length === 0 && <p className="text-xs text-slate-400 italic text-center pt-8">Belum ada data luaran.</p>}
                        {profile.luaran_lainnya.map(l => (
                           <div key={l.id} className="bg-white p-3 mb-2 rounded-lg border border-slate-100 shadow-sm flex justify-between items-center">
                              <div><p className="text-xs font-bold">{l.judul_luaran}</p><p className="text-[10px] text-slate-500">{l.jenis} • {l.tahun}</p></div>
                              <div className="flex items-center gap-2">
                                 {l.bukti_pendukung && <a href={l.bukti_pendukung} target="_blank" className="text-indigo-500 hover:text-indigo-700"><LinkIcon size={12}/></a>}
                                 {isEditing && <button onClick={() => removeItem('luaran_lainnya', l.id)}><Trash2 size={12} className="text-rose-400"/></button>}
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
                  <div className="space-y-4">
                     <div className="flex justify-between items-center border-b pb-2">
                        <h3 className="font-bold text-slate-800 text-sm">Tabel 4.3 Mitra PkM</h3>
                        {isEditing && <button onClick={() => openModal('mitra')} className="text-indigo-600 text-xs font-bold">+ Add</button>}
                     </div>
                     <div className="bg-slate-50 rounded-xl p-4 min-h-[100px] border border-slate-200">
                        {profile.mitra_pkm.length === 0 && <p className="text-xs text-slate-400 italic text-center pt-8">Belum ada data mitra.</p>}
                        {profile.mitra_pkm.map(m => (
                           <div key={m.id} className="bg-white p-3 mb-2 rounded-lg border border-slate-100 shadow-sm flex justify-between items-center">
                              <div><p className="text-xs font-bold">{m.nama_mitra}</p><p className="text-[10px] text-slate-500">{m.jenis_mitra} • {m.nama_dosen}</p></div>
                              {isEditing && <button onClick={() => removeItem('mitra_pkm', m.id)}><Trash2 size={12} className="text-rose-400"/></button>}
                           </div>
                        ))}
                     </div>
                  </div>
               </div>
            </div>
         )}

         {/* TAB 6: MAHASISWA */}
         {activeTab === 'mahasiswa' && (
            <div className="space-y-12 animate-in slide-in-from-right-4">
               {/* 2.3 IPK LULUSAN */}
               <div className="space-y-4">
                  <div className="flex justify-between items-center bg-slate-100 p-4 rounded-2xl border border-slate-200">
                     <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Tabel 2.3 IPK Lulusan</h3>
                     {isEditing && <button onClick={() => openModal('ipk')} className="px-3 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-bold shadow-lg flex items-center gap-2"><Plus size={14}/> Tambah</button>}
                  </div>
                  <div className="overflow-x-auto border border-slate-200 rounded-xl shadow-sm max-w-4xl">
                     <table className="w-full text-xs text-left">
                        <TableHeader>
                           <tr><th className="p-3">No</th><th className="p-3">Tahun Lulus</th><th className="p-3">Jml Lulusan</th><th className="p-3">Min</th><th className="p-3">Rata-rata</th><th className="p-3">Maks</th>{isEditing && <th className="p-3 bg-slate-200">Aksi</th>}</tr>
                        </TableHeader>
                        <tbody className="divide-y divide-slate-100 text-center">
                           {profile.statistik_ipk.map((d, i) => (
                              <tr key={d.id}>
                                 <td className="p-3">{i+1}</td>
                                 <td className="p-3 font-bold">{d.tahun_lulus}</td>
                                 <td className="p-3">{d.jumlah_lulusan}</td>
                                 <td className="p-3">{d.ipk_min}</td>
                                 <td className="p-3 font-bold bg-indigo-50 text-indigo-700 rounded">{d.ipk_avg}</td>
                                 <td className="p-3">{d.ipk_max}</td>
                                 {isEditing && <td className="p-3"><button onClick={() => removeItem('statistik_ipk', d.id)}><Trash2 size={14} className="text-rose-500 mx-auto"/></button></td>}
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
               </div>
            </div>
         )}

         {/* --- FLOATING MODAL COMPONENT --- */}
         {modalConfig.isOpen && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
               <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setModalConfig({ ...modalConfig, isOpen: false })}></div>
               <div className="relative bg-white w-full max-w-xl rounded-3xl shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
                  <div className="px-8 py-5 border-b flex justify-between items-center bg-slate-50">
                     <h3 className="font-black text-lg text-slate-800 uppercase tracking-tight">
                        {modalConfig.data.id && profile[modalConfig.type === 'keuangan' ? 'tabel_keuangan' : 'daftar_dosen']?.find((x:any) => x.id === modalConfig.data.id) ? 'Edit Data' : 'Tambah Data Baru'}
                     </h3>
                     <button onClick={() => setModalConfig({ ...modalConfig, isOpen: false })} className="p-2 hover:bg-slate-200 rounded-full"><X size={20}/></button>
                  </div>
                  
                  <div className="p-8 max-h-[70vh] overflow-y-auto">
                     <form onSubmit={(e) => { 
                        e.preventDefault(); 
                        const formData = new FormData(e.currentTarget); 
                        const data: any = { id: modalConfig.data.id }; 
                        formData.forEach((value, key) => data[key] = value); 
                        
                        // Handle Checkboxes
                        if(modalConfig.type === 'mk') data['mata_kuliah_kompetensi'] = formData.get('mata_kuliah_kompetensi') === 'on'; 
                        if(modalConfig.type === 'kegiatan_mhs') data['tema_sesuai_roadmap'] = formData.get('tema_sesuai_roadmap') === 'on'; 
                        
                        // Handle Numeric Fields Parsing to ensure math works
                        const numberFields = [
                            'bobot_kuliah', 'bobot_seminar', 'bobot_praktikum', 'semester', 'konversi_kredit_jam',
                            'upps_ts2', 'upps_ts1', 'upps_ts', 'ps_ts2', 'ps_ts1', 'ps_ts',
                            'jumlah_lulusan', 'ipk_min', 'ipk_avg', 'ipk_max',
                            'jumlah_ts2', 'jumlah_ts1', 'jumlah_ts'
                        ];
                        numberFields.forEach(field => {
                            if (data[field] !== undefined) data[field] = parseFloat(data[field]) || 0;
                        });

                        handleSaveModal(data); 
                     }} className="space-y-4">
                        
                        {/* FORM DOSEN */}
                        {modalConfig.type === 'dosen' && (
                           <>
                              <div><label className="text-xs font-bold text-slate-500">Nama Dosen</label><input name="nama" defaultValue={modalConfig.data.nama} className="w-full border p-2 rounded-lg text-sm font-bold" required /></div>
                              <div className="grid grid-cols-2 gap-4">
                                 <div><label className="text-xs font-bold text-slate-500">NIDN</label><input name="nidn" defaultValue={modalConfig.data.nidn} className="w-full border p-2 rounded-lg text-sm" /></div>
                                 <div><label className="text-xs font-bold text-slate-500">Jabatan</label><select name="jabatan_akademik" defaultValue={modalConfig.data.jabatan_akademik} className="w-full border p-2 rounded-lg text-sm"><option>Asisten Ahli</option><option>Lektor</option><option>Lektor Kepala</option></select></div>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                 <div><label className="text-xs font-bold text-slate-500">Pend. Magister</label><input name="pendidikan_magister" defaultValue={modalConfig.data.pendidikan_magister} className="w-full border p-2 rounded-lg text-sm" /></div>
                                 <div><label className="text-xs font-bold text-slate-500">Pend. Doktor</label><input name="pendidikan_doktor" defaultValue={modalConfig.data.pendidikan_doktor} className="w-full border p-2 rounded-lg text-sm" /></div>
                              </div>
                              <div><label className="text-xs font-bold text-slate-500">Bidang Keahlian</label><input name="bidang_keahlian" defaultValue={modalConfig.data.bidang_keahlian} className="w-full border p-2 rounded-lg text-sm" /></div>
                              <div><label className="text-xs font-bold text-slate-500">Bukti Pendukung (Link)</label><input name="bukti_pendukung" defaultValue={modalConfig.data.bukti_pendukung} className="w-full border p-2 rounded-lg text-sm" /></div>
                              <input type="hidden" name="status_dosen" value="Tetap" />
                           </>
                        )}

                        {/* FORM ASOSIASI */}
                        {modalConfig.type === 'asosiasi' && (
                           <>
                              <div><label className="text-xs font-bold text-slate-500">Nama Dosen</label><input name="nama_dosen" defaultValue={modalConfig.data.nama_dosen} className="w-full border p-2 rounded-lg text-sm font-bold" required /></div>
                              <div className="grid grid-cols-2 gap-4">
                                 <div><label className="text-xs font-bold text-slate-500">Nama Asosiasi</label><input name="nama_asosiasi" defaultValue={modalConfig.data.nama_asosiasi} className="w-full border p-2 rounded-lg text-sm" /></div>
                                 <div><label className="text-xs font-bold text-slate-500">No. Anggota</label><input name="no_anggota" defaultValue={modalConfig.data.no_anggota} className="w-full border p-2 rounded-lg text-sm" /></div>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                 <div><label className="text-xs font-bold text-slate-500">Tahun Aktif</label><input name="tahun_aktif" defaultValue={modalConfig.data.tahun_aktif} className="w-full border p-2 rounded-lg text-sm" /></div>
                                 <div><label className="text-xs font-bold text-slate-500">Bukti (Link)</label><input name="bukti_pendukung" defaultValue={modalConfig.data.bukti_pendukung} className="w-full border p-2 rounded-lg text-sm" /></div>
                              </div>
                           </>
                        )}

                        {/* FORM KEUANGAN */}
                        {modalConfig.type === 'keuangan' && (
                           <>
                              <div><label className="text-xs font-bold text-slate-500">Jenis Penggunaan</label><input name="jenis_penggunaan" defaultValue={modalConfig.data.jenis_penggunaan} className="w-full border p-2 rounded-lg text-sm font-bold bg-slate-100" /></div>
                              <p className="text-[10px] font-black uppercase text-indigo-500 mt-4 border-b pb-1">Unit Pengelola (UPPS)</p>
                              <div className="grid grid-cols-3 gap-2">
                                 <input name="upps_ts2" type="number" defaultValue={modalConfig.data.upps_ts2} placeholder="TS-2" className="border p-2 rounded text-sm"/>
                                 <input name="upps_ts1" type="number" defaultValue={modalConfig.data.upps_ts1} placeholder="TS-1" className="border p-2 rounded text-sm"/>
                                 <input name="upps_ts" type="number" defaultValue={modalConfig.data.upps_ts} placeholder="TS" className="border p-2 rounded text-sm"/>
                              </div>
                              <p className="text-[10px] font-black uppercase text-indigo-500 mt-4 border-b pb-1">Program Studi (PS)</p>
                              <div className="grid grid-cols-3 gap-2">
                                 <input name="ps_ts2" type="number" defaultValue={modalConfig.data.ps_ts2} placeholder="TS-2" className="border p-2 rounded text-sm"/>
                                 <input name="ps_ts1" type="number" defaultValue={modalConfig.data.ps_ts1} placeholder="TS-1" className="border p-2 rounded text-sm"/>
                                 <input name="ps_ts" type="number" defaultValue={modalConfig.data.ps_ts} placeholder="TS" className="border p-2 rounded text-sm"/>
                              </div>
                           </>
                        )}

                        {/* FORM KURIKULUM (MK) */}
                        {modalConfig.type === 'mk' && (
                           <>
                              <div className="grid grid-cols-3 gap-4">
                                 <div><label className="text-xs font-bold text-slate-500">Kode MK</label><input name="kode_mk" defaultValue={modalConfig.data.kode_mk} className="w-full border p-2 rounded-lg text-sm" required /></div>
                                 <div className="col-span-2"><label className="text-xs font-bold text-slate-500">Nama Mata Kuliah</label><input name="nama_mk" defaultValue={modalConfig.data.nama_mk} className="w-full border p-2 rounded-lg text-sm font-bold" required /></div>
                              </div>
                              <div className="grid grid-cols-4 gap-2">
                                 <div><label className="text-xs font-bold text-slate-500">Smt</label><input name="semester" type="number" defaultValue={modalConfig.data.semester || 1} className="w-full border p-2 rounded-lg text-sm" /></div>
                                 <div><label className="text-xs font-bold text-slate-500">SKS Kuliah</label><input name="bobot_kuliah" type="number" defaultValue={modalConfig.data.bobot_kuliah || 1} className="w-full border p-2 rounded-lg text-sm" /></div>
                                 <div><label className="text-xs font-bold text-slate-500">SKS Seminar</label><input name="bobot_seminar" type="number" defaultValue={modalConfig.data.bobot_seminar || 0} className="w-full border p-2 rounded-lg text-sm" /></div>
                                 <div><label className="text-xs font-bold text-slate-500">SKS Praktik</label><input name="bobot_praktikum" type="number" defaultValue={modalConfig.data.bobot_praktikum || 1} className="w-full border p-2 rounded-lg text-sm" /></div>
                              </div>
                              <div className="flex items-center gap-2 mt-2 bg-slate-50 p-2 rounded border">
                                 <input type="checkbox" name="mata_kuliah_kompetensi" defaultChecked={modalConfig.data.mata_kuliah_kompetensi} className="w-4 h-4"/> 
                                 <span className="text-xs font-bold text-slate-700">Mata Kuliah Kompetensi Utama?</span>
                              </div>
                              <div><label className="text-xs font-bold text-slate-500">Capaian Pembelajaran</label><textarea name="capaian_pembelajaran" defaultValue={modalConfig.data.capaian_pembelajaran} className="w-full border p-2 rounded-lg text-sm h-16" /></div>
                              <div className="grid grid-cols-2 gap-4">
                                 <div><label className="text-xs font-bold text-slate-500">Unit Penyelenggara</label><input name="unit_penyelenggara" defaultValue={modalConfig.data.unit_penyelenggara} className="w-full border p-2 rounded-lg text-sm" /></div>
                                 <div><label className="text-xs font-bold text-slate-500">Bukti (Link RPS)</label><input name="bukti_pendukung" defaultValue={modalConfig.data.bukti_pendukung} className="w-full border p-2 rounded-lg text-sm" /></div>
                              </div>
                           </>
                        )}

                        {/* FORM KEGIATAN MHS */}
                        {modalConfig.type === 'kegiatan_mhs' && (
                           <>
                              <div><label className="text-xs font-bold text-slate-500">Judul Kegiatan</label><input name="judul_kegiatan" defaultValue={modalConfig.data.judul_kegiatan} className="w-full border p-2 rounded-lg text-sm" required /></div>
                              <div className="grid grid-cols-2 gap-4">
                                 <div><label className="text-xs font-bold text-slate-500">Nama Dosen</label><input name="nama_dosen" defaultValue={modalConfig.data.nama_dosen} className="w-full border p-2 rounded-lg text-sm" /></div>
                                 <div><label className="text-xs font-bold text-slate-500">Nama Mahasiswa</label><input name="nama_mahasiswa" defaultValue={modalConfig.data.nama_mahasiswa} className="w-full border p-2 rounded-lg text-sm" /></div>
                              </div>
                              <div className="grid grid-cols-2 gap-4 items-center">
                                 <div><label className="text-xs font-bold text-slate-500">Tahun</label><input name="tahun" defaultValue={modalConfig.data.tahun || '2024'} className="w-full border p-2 rounded-lg text-sm" /></div>
                                 <label className="flex items-center gap-2 cursor-pointer mt-4"><input type="checkbox" name="tema_sesuai_roadmap" defaultChecked={modalConfig.data.tema_sesuai_roadmap} className="w-4 h-4"/> <span className="text-xs font-bold">Sesuai Roadmap?</span></label>
                              </div>
                              <div><label className="text-xs font-bold text-slate-500">Bukti Pendukung (Link)</label><input name="bukti_pendukung" defaultValue={modalConfig.data.bukti_pendukung} className="w-full border p-2 rounded-lg text-sm" /></div>
                              <div><label className="text-xs font-bold text-slate-500">Tipe</label><select name="tipe" defaultValue={modalConfig.data.tipe} className="w-full border p-2 rounded-lg text-sm"><option>Penelitian</option><option>PkM</option></select></div>
                           </>
                        )}

                        {/* FORM LUARAN */}
                        {modalConfig.type === 'luaran' && (
                           <>
                              <div><label className="text-xs font-bold text-slate-500">Judul Luaran / Buku</label><input name="judul_luaran" defaultValue={modalConfig.data.judul_luaran} className="w-full border p-2 rounded-lg text-sm font-bold" required /></div>
                              <div className="grid grid-cols-2 gap-4">
                                 <div><label className="text-xs font-bold text-slate-500">Jenis</label><select name="jenis" defaultValue={modalConfig.data.jenis} className="w-full border p-2 rounded-lg text-sm"><option>HKI (Paten/Hak Cipta)</option><option>Buku Ber-ISBN</option><option>Teknologi Tepat Guna</option></select></div>
                                 <div><label className="text-xs font-bold text-slate-500">Tahun</label><input name="tahun" defaultValue={modalConfig.data.tahun} className="w-full border p-2 rounded-lg text-sm" /></div>
                              </div>
                              <div><label className="text-xs font-bold text-slate-500">Keterangan (No. SK / ISBN)</label><input name="keterangan" defaultValue={modalConfig.data.keterangan} className="w-full border p-2 rounded-lg text-sm" /></div>
                              <div><label className="text-xs font-bold text-slate-500">Bukti (Link)</label><input name="bukti_pendukung" defaultValue={modalConfig.data.bukti_pendukung} className="w-full border p-2 rounded-lg text-sm" /></div>
                           </>
                        )}

                        {/* FORM MITRA */}
                        {modalConfig.type === 'mitra' && (
                           <>
                              <div><label className="text-xs font-bold text-slate-500">Nama Mitra</label><input name="nama_mitra" defaultValue={modalConfig.data.nama_mitra} className="w-full border p-2 rounded-lg text-sm font-bold" required /></div>
                              <div className="grid grid-cols-2 gap-4">
                                 <div><label className="text-xs font-bold text-slate-500">Nama Dosen</label><input name="nama_dosen" defaultValue={modalConfig.data.nama_dosen} className="w-full border p-2 rounded-lg text-sm" /></div>
                                 <div><label className="text-xs font-bold text-slate-500">Jenis Mitra</label><select name="jenis_mitra" defaultValue={modalConfig.data.jenis_mitra} className="w-full border p-2 rounded-lg text-sm"><option>Desa</option><option>UKM</option><option>Koperasi</option><option>Kelompok</option><option>Lainnya</option></select></div>
                              </div>
                              <div><label className="text-xs font-bold text-slate-500">Keterangan Kegiatan</label><textarea name="keterangan" defaultValue={modalConfig.data.keterangan} className="w-full border p-2 rounded-lg text-sm h-16" /></div>
                           </>
                        )}

                        {/* FORM IPK */}
                        {modalConfig.type === 'ipk' && (
                           <>
                              <div className="grid grid-cols-2 gap-4">
                                 <div><label className="text-xs font-bold text-slate-500">Tahun Lulus (TS-X)</label><input name="tahun_lulus" defaultValue={modalConfig.data.tahun_lulus} className="w-full border p-2 rounded-lg text-sm font-bold" required /></div>
                                 <div><label className="text-xs font-bold text-slate-500">Jml Lulusan</label><input name="jumlah_lulusan" type="number" defaultValue={modalConfig.data.jumlah_lulusan} className="w-full border p-2 rounded-lg text-sm" /></div>
                              </div>
                              <p className="text-[10px] font-black uppercase text-indigo-500 mt-2 border-b pb-1">Indeks Prestasi Kumulatif (IPK)</p>
                              <div className="grid grid-cols-3 gap-2">
                                 <div><label className="text-xs font-bold text-slate-500">Min</label><input name="ipk_min" type="number" step="0.01" defaultValue={modalConfig.data.ipk_min} className="w-full border p-2 rounded-lg text-sm" /></div>
                                 <div><label className="text-xs font-bold text-slate-500">Rata-rata</label><input name="ipk_avg" type="number" step="0.01" defaultValue={modalConfig.data.ipk_avg} className="w-full border p-2 rounded-lg text-sm" /></div>
                                 <div><label className="text-xs font-bold text-slate-500">Maks</label><input name="ipk_max" type="number" step="0.01" defaultValue={modalConfig.data.ipk_max} className="w-full border p-2 rounded-lg text-sm" /></div>
                              </div>
                           </>
                        )}

                        <button type="submit" className="w-full py-4 bg-indigo-600 text-white rounded-xl font-black uppercase tracking-widest shadow-lg hover:bg-indigo-700 transition-all mt-6">Simpan Data</button>
                     </form>
                  </div>
               </div>
            </div>
         )}

      </div>
    </div>
  );
};
export default ProdiProfileView;
