
import React, { useState, useEffect, useRef } from 'react';
import { 
  Settings, Calendar, Users, Save, AlertCircle, CheckCircle2, CalendarDays, Building2, ToggleLeft, ToggleRight, ShieldAlert, GraduationCap, Phone, Contact, UserCog, LayoutTemplate, Image, Trash2, Plus, ArrowUp, ArrowDown, UserPlus, ShieldCheck, User, History, Archive, FileText, BarChart3, ChevronRight, Clock, Camera, Lock, Eye, EyeOff, Target, Edit
} from 'lucide-react';
import { HeroSlide, StrategicAgenda, BrandingConfig } from '../types';
import { useAuth } from '../contexts/AuthContext';

const STORAGE_KEYS = {
  CONFIG: 'siapepi_cycle_config',
  SCHEDULES: 'siapepi_schedules',
  SLIDES: 'siapepi_hero_slides',
  USERS: 'siapepi_master_users',
  AGENDA: 'siapepi_strategic_agendas'
};

const INITIAL_HISTORY = [
  { id: 1, name: 'AMI Semester Genap 2023/2024', year: '2023', semester: 'Genap', status: 'Selesai', date: 'Feb 2024 - Jun 2024', score: 3.45, docs_count: 142 },
  { id: 2, name: 'AMI Semester Ganjil 2023/2024', year: '2023', semester: 'Ganjil', status: 'Selesai', date: 'Agu 2023 - Des 2023', score: 3.20, docs_count: 128 },
  { id: 3, name: 'AMI Semester Genap 2022/2023', year: '2022', semester: 'Genap', status: 'Selesai', date: 'Feb 2023 - Jun 2023', score: 2.95, docs_count: 115 },
];

const INITIAL_AGENDAS: StrategicAgenda[] = [
  { id: 1, name: 'Akreditasi LAM-PTIP (TMP & TAP)', targetDate: '2026-10-01', description: 'Batas akhir pengajuan borang akreditasi untuk Prodi TMP dan TAP.', responsibleUnit: 'Prodi TMP & TAP', isActive: true },
  { id: 2, name: 'Pelaksanaan AMI Internal', targetDate: '2026-09-01', description: 'Kick-off Audit Mutu Internal untuk seluruh unit kerja di PEPI.', responsibleUnit: 'Semua Unit', isActive: false }
];

const SettingsView: React.FC<{currentUser?: any}> = ({ currentUser }) => {
  const { brandingConfig, updateBranding } = useAuth();
  const [activeTab, setActiveTab] = useState<'general' | 'schedule'>('general');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  // --- CYCLE STATE ---
  const [cycleConfig, setCycleConfig] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CONFIG);
    return saved ? JSON.parse(saved) : { name: 'AMI Semester Ganjil 2024/2025', year: '2024', semester: 'Ganjil', skNumber: 'SK-DIR/2024/005', isActive: true };
  });

  const [schedules, setSchedules] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SCHEDULES);
    return saved ? JSON.parse(saved) : [
      { id: 'planning', label: 'Perencanaan', start: '2024-10-01', end: '2024-10-05', active: true },
      { id: 'execution', label: 'Audit Lapangan', start: '2024-10-21', end: '2024-10-25', active: false },
    ];
  });
  
  // --- BRANDING STATE ---
  const [brandingForm, setBrandingForm] = useState<BrandingConfig>(brandingConfig);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // --- AGENDA STATE (MOVED FROM UPM VIEW) ---
  const [agendas, setAgendas] = useState<StrategicAgenda[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.AGENDA);
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            return Array.isArray(parsed) ? parsed : INITIAL_AGENDAS;
        } catch (e) { return INITIAL_AGENDAS; }
    }
    return INITIAL_AGENDAS;
  });
  const [editingAgenda, setEditingAgenda] = useState<StrategicAgenda | null>(null);

  useEffect(() => { localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(cycleConfig)); }, [cycleConfig]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.SCHEDULES, JSON.stringify(schedules)); }, [schedules]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.AGENDA, JSON.stringify(agendas)); }, [agendas]);


  const handleSave = () => {
    setSaveStatus('saving');
    updateBranding(brandingForm);
    setTimeout(() => { setSaveStatus('saved'); setTimeout(() => setSaveStatus('idle'), 2000); }, 1000);
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) return alert('Hanya file gambar yang diizinkan.');
      if (file.size > 1 * 1024 * 1024) return alert('Ukuran file maksimal 1MB.');

      const reader = new FileReader();
      reader.onloadend = () => {
        setBrandingForm({ ...brandingForm, appLogo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  // --- AGENDA HANDLERS ---
  const handleSaveAgenda = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingAgenda) return;
    setAgendas(prev => prev.map(a => a.id === editingAgenda.id ? editingAgenda : a));
    setEditingAgenda(null);
  };

  const handleAddNewAgenda = () => {
    const newAgenda: StrategicAgenda = {
      id: Date.now(), name: 'Agenda Baru',
      targetDate: new Date().toISOString().split('T')[0], description: '',
      isActive: agendas.every(a => !a.isActive),
    };
    setAgendas(prev => [...prev, newAgenda]);
    setEditingAgenda(newAgenda);
  };
  
  const handleActivateAgenda = (id: number) => {
    setAgendas(prev => prev.map(a => ({ ...a, isActive: a.id === id })));
  };

  const handleDeleteAgenda = (id: number) => {
    if (window.confirm('Hapus agenda ini?')) {
      setAgendas(prev => prev.filter(a => a.id !== id));
    }
  };


  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="flex justify-between items-center">
        <div><h2 className="text-2xl font-black">Pengaturan SIAPEPI</h2><p className="text-sm text-slate-500">Konfigurasi parameter sistem & jadwal.</p></div>
        <button onClick={handleSave} className="px-6 py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg hover:bg-indigo-700 transition-all">
          {saveStatus === 'saving' ? 'Menyimpan...' : saveStatus === 'saved' ? 'Tersimpan' : <><Save size={18} className="inline mr-2"/>Simpan Perubahan</>}
        </button>
      </div>

      <div className="flex bg-white p-1 rounded-2xl border border-slate-200 w-fit shadow-sm">
        {[
            {id:'general', label:'Sistem & Agenda'}, 
            {id:'schedule', label:'Jadwal Kegiatan'},
        ].map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id as any)} className={`px-6 py-2 rounded-xl text-xs font-bold uppercase transition-all ${activeTab === t.id ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}>{t.label}</button>
        ))}
      </div>

      <div className="bg-white border border-slate-200 rounded-[2.rem] p-8 shadow-sm min-h-[500px]">
        {activeTab === 'general' && (
          <div className="space-y-12 animate-in slide-in-from-right-4">
            
            {/* NEW: Branding Section */}
            {currentUser?.role === 'Super Admin' && (
              <div className="space-y-6">
                 <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><LayoutTemplate size={20}/></div>
                    <h3 className="text-lg font-black text-slate-900">Branding & Personalisasi</h3>
                 </div>
                 <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                    <div className="md:col-span-2 space-y-4">
                       <div>
                         <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Nama Aplikasi</label>
                         <input type="text" value={brandingForm.appName} onChange={(e) => setBrandingForm({...brandingForm, appName: e.target.value})} className="w-full bg-white border border-slate-200 p-3 rounded-xl text-sm font-bold shadow-sm outline-none focus:ring-2 focus:ring-indigo-500" />
                       </div>
                       <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Logo Aplikasi (Rekomendasi: 1:1, PNG)</label>
                          <button onClick={() => logoInputRef.current?.click()} className="w-full text-center p-3 bg-white border border-slate-200 rounded-xl text-xs font-bold shadow-sm hover:bg-slate-100">Ganti Logo</button>
                          <input type="file" ref={logoInputRef} onChange={handleLogoChange} className="hidden" accept="image/png, image/jpeg, image/svg+xml" />
                       </div>
                    </div>
                    <div className="flex justify-center items-center">
                       <div className="w-32 h-32 bg-white rounded-3xl p-4 shadow-lg border-2 border-slate-200">
                          <img src={brandingForm.appLogo} alt="Logo Preview" className="w-full h-full object-contain"/>
                       </div>
                    </div>
                 </div>
              </div>
            )}

            {/* Bagian 1: Konfigurasi Siklus Aktif */}
            <div className="space-y-6 pt-10 border-t">
               <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><Settings size={20}/></div>
                  <h3 className="text-lg font-black text-slate-900">Konfigurasi Siklus Aktif</h3>
               </div>
               
               <div className="bg-indigo-50/50 p-6 rounded-3xl border border-indigo-100 space-y-5">
                  <div>
                     <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Nama Siklus Audit</label>
                     <input type="text" value={cycleConfig.name} onChange={(e) => setCycleConfig({...cycleConfig, name: e.target.value})} className="w-full bg-white border border-indigo-200 p-4 rounded-2xl text-sm font-bold shadow-sm outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Tahun</label>
                        <input type="number" value={cycleConfig.year} onChange={(e) => setCycleConfig({...cycleConfig, year: e.target.value})} className="w-full bg-white border border-indigo-200 p-3 rounded-xl text-sm font-bold outline-none" />
                     </div>
                     <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Semester</label>
                        <select value={cycleConfig.semester} onChange={(e) => setCycleConfig({...cycleConfig, semester: e.target.value})} className="w-full bg-white border border-indigo-200 p-3 rounded-xl text-sm outline-none">
                           <option>Ganjil</option><option>Genap</option>
                        </select>
                     </div>
                  </div>
                  <div>
                     <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Status Sistem</label>
                     <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-indigo-200">
                        {cycleConfig.isActive ? <ToggleRight className="text-emerald-500 cursor-pointer" size={36} onClick={() => setCycleConfig({...cycleConfig, isActive: false})}/> : <ToggleLeft className="text-slate-300 cursor-pointer" size={36} onClick={() => setCycleConfig({...cycleConfig, isActive: true})}/>}
                        <span className={`text-xs font-black uppercase tracking-widest ${cycleConfig.isActive ? 'text-emerald-600' : 'text-slate-400'}`}>{cycleConfig.isActive ? 'Siklus Sedang Berjalan' : 'Siklus Ditutup (Read Only)'}</span>
                     </div>
                  </div>
               </div>
            </div>
            
            {/* Strategic Agenda Management Panel */}
            <div className="space-y-6 pt-10 border-t">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                   <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><Target size={20}/></div>
                   <h3 className="font-bold text-lg text-slate-900">Manajemen Agenda Strategis</h3>
                </div>
                <button onClick={handleAddNewAgenda} className="px-4 py-2 bg-amber-600 text-white rounded-xl text-xs font-bold shadow-lg flex items-center gap-2"><Plus size={14}/> Tambah Agenda</button>
              </div>
              <div className="space-y-4">
                {agendas.map(agenda => (
                  editingAgenda?.id === agenda.id ? (
                    <form key={agenda.id} onSubmit={handleSaveAgenda} className="bg-indigo-50 p-4 rounded-2xl border border-indigo-200 space-y-3">
                      <input type="text" value={editingAgenda.name} onChange={e => setEditingAgenda({...editingAgenda, name: e.target.value})} className="w-full p-2 border rounded-lg text-sm font-bold" placeholder="Nama Agenda" />
                      <input type="date" value={editingAgenda.targetDate} onChange={e => setEditingAgenda({...editingAgenda, targetDate: e.target.value})} className="w-full p-2 border rounded-lg text-sm" />
                      <textarea value={editingAgenda.description} onChange={e => setEditingAgenda({...editingAgenda, description: e.target.value})} className="w-full p-2 border rounded-lg text-xs" placeholder="Deskripsi..."/>
                      <div className="flex gap-2">
                        <button type="submit" className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs font-bold">Simpan</button>
                        <button type="button" onClick={() => setEditingAgenda(null)} className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold">Batal</button>
                      </div>
                    </form>
                  ) : (
                    <div key={agenda.id} className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <input type="radio" name="active-agenda" checked={agenda.isActive} onChange={() => handleActivateAgenda(agenda.id)} className="w-5 h-5 text-indigo-600" title="Aktifkan di Dashboard" />
                        <div>
                          <p className="font-bold text-slate-800 text-sm">{agenda.name}</p>
                          <p className="text-xs text-slate-500 font-medium">Target: {new Date(agenda.targetDate).toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => setEditingAgenda(agenda)} className="p-2 text-slate-400 hover:text-indigo-600"><Edit size={16}/></button>
                        <button onClick={() => handleDeleteAgenda(agenda.id)} className="p-2 text-slate-400 hover:text-rose-600"><Trash2 size={16}/></button>
                      </div>
                    </div>
                  )
                ))}
              </div>
            </div>

            {/* Bagian 2: Riwayat Siklus (History) */}
            <div className="space-y-6 pt-10 border-t">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <div className="p-2 bg-slate-100 text-slate-600 rounded-lg"><History size={20}/></div>
                     <h3 className="text-lg font-black text-slate-900">Arsip Riwayat Siklus</h3>
                  </div>
                  <button className="text-xs font-bold text-indigo-600 flex items-center gap-1 hover:underline"><Archive size={14}/> Lihat Semua Arsip</button>
               </div>

               <div className="space-y-3">
                  {INITIAL_HISTORY.map((cycle) => (
                     <div key={cycle.id} className="group flex items-center justify-between p-5 bg-white border border-slate-200 rounded-[20px] hover:border-indigo-300 hover:shadow-lg transition-all cursor-pointer">
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-12 bg-slate-50 rounded-2xl flex flex-col items-center justify-center border border-slate-100 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                              <span className="text-[10px] font-black uppercase text-slate-400">RATA</span>
                              <span className="text-sm font-black text-slate-800">{cycle.score}</span>
                           </div>
                           <div>
                              <div className="flex items-center gap-2 mb-1">
                                 <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[9px] font-black rounded uppercase tracking-widest border border-emerald-200">Selesai</span>
                                 <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1"><Clock size={10}/> {cycle.date}</span>
                              </div>
                              <h4 className="font-bold text-slate-800 text-sm">{cycle.name}</h4>
                           </div>
                        </div>
                        
                        <div className="flex items-center gap-4 opacity-60 group-hover:opacity-100 transition-opacity">
                           <div className="text-right hidden sm:block">
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Dokumen</p>
                              <p className="text-xs font-bold text-slate-700">{cycle.docs_count} Berkas</p>
                           </div>
                           <button className="p-2 bg-slate-100 rounded-xl text-slate-400 hover:bg-indigo-600 hover:text-white transition-all">
                              <ChevronRight size={18} />
                           </button>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
          </div>
        )}

        {activeTab === 'schedule' && (
          <div className="divide-y animate-in slide-in-from-right-4">
            {schedules.map(s => (
                <div key={s.id} className="py-4 flex justify-between items-center"><span className="font-bold text-sm">{s.label}</span><div className="flex gap-2"><input type="date" value={s.start} onChange={(e) => setSchedules(schedules.map(sc => sc.id === s.id ? {...sc, start: e.target.value} : sc))} className="border p-2 rounded-lg text-xs" /><input type="date" value={s.end} onChange={(e) => setSchedules(schedules.map(sc => sc.id === s.id ? {...sc, end: e.target.value} : sc))} className="border p-2 rounded-lg text-xs" /></div></div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
export default SettingsView;
