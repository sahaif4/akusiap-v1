import React, { useState, useEffect, useRef } from 'react';
import { 
  UserCog, Edit, Save, Camera, Mail, Phone, Building2, User as UserIcon, Lock, Eye, EyeOff, ShieldCheck, 
  Briefcase, CheckCircle2, ListTodo, Clock, FileSignature, BarChart3, Download, Activity, Send, MessageSquare, X
} from 'lucide-react';
import { CurrentUser, Role, User } from '../types';
import { getActivityLog } from '../services/activityLogService';
import { ActivityLogItem } from '../types/dashboard';
import * as apiService from '../services/apiService';

const MOCK_TASKS = [
    { id: 1, title: 'Menyusun Instrumen Audit untuk Prodi TMP', cycle: 'AMI 2024/2025', role: 'Auditor', due: '2024-10-05', status: 'Completed' },
    { id: 2, title: 'Melakukan Desk Evaluation Prodi TMP', cycle: 'AMI 2024/2025', role: 'Auditor', due: '2024-10-20', status: 'In Progress' },
    { id: 3, title: 'Mengunggah Dokumen Bukti Standar Pendidikan', cycle: 'AMI 2024/2025', role: 'Auditee', due: '2024-10-15', status: 'In Progress' },
];

const ROLE_DESCRIPTIONS: Record<Role, string> = {
    [Role.SUPER_ADMIN]: "Mengelola infrastruktur data, pengguna, dan konfigurasi global sistem.",
    [Role.ADMIN_UPM]: "Merancang siklus audit, mengelola standar, dan menugaskan auditor.",
    [Role.AUDITOR]: "Melaksanakan evaluasi, mencatat temuan, dan menyusun berita acara audit.",
    [Role.ADMIN_PRODI]: "Menyediakan dokumen bukti, mengisi LED, dan menindaklanjuti temuan.",
    [Role.AUDITEE]: "Bertindak sebagai perwakilan unit yang diaudit, menyediakan data dan klarifikasi.",
    [Role.KAPRODI]: "Penanggung jawab mutu di tingkat program studi dan menyetujui hasil audit.",
    [Role.PIMPINAN]: "Menerima laporan hasil audit dan menetapkan kebijakan strategis mutu.",
    [Role.WADIR]: "Mendukung Direktur dalam pengawasan dan implementasi kebijakan mutu."
};

interface ProfilePortfolioViewProps {
  currentUser: CurrentUser | null;
  onProfileUpdate: (updatedData: Partial<CurrentUser>) => void;
}

const ProfilePortfolioView: React.FC<ProfilePortfolioViewProps> = ({ currentUser, onProfileUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  const [initialProfileData, setInitialProfileData] = useState<any>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const [portfolioLog, setPortfolioLog] = useState<ActivityLogItem[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  
  const [isCorrectionModalOpen, setIsCorrectionModalOpen] = useState(false);
  const [correctionRequest, setCorrectionRequest] = useState('');
  
  const photoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (currentUser) {
      apiService.getUsers().then(users => {
        const userProfile = users.find((u: any) => u.id === currentUser.id) || {
          ...currentUser,
          password: 'pepi123' // Default password for display, won't be saved unless changed
        };
        setProfileData(userProfile);
        setInitialProfileData(userProfile);
      });
      
      getActivityLog().then(logs => {
        const userLogs = logs.filter(log => log.user === currentUser.name);
        setPortfolioLog(userLogs);
      });
    }
  }, [currentUser]);

  const handleEditToggle = () => {
    if (isEditing) { // CANCEL
      setProfileData(initialProfileData);
      setPhotoPreview(null);
    } else { // START EDITING
      setInitialProfileData(profileData);
    }
    setIsEditing(!isEditing);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) return alert('Hanya file gambar yang diizinkan.');
      if (file.size > 2 * 1024 * 1024) return alert('Ukuran file maksimal 2MB.');

      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPhotoPreview(result);
        setProfileData({ ...profileData, foto: result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!profileData || !hasChanges) return;

    setSaveStatus('saving');
    
    try {
        const payload: Partial<User> = {
            id: profileData.id,
            nama: profileData.nama,
            nip: profileData.nip,
            role: profileData.role,
            unit_id: profileData.unit_id,
            status: profileData.status,
            assignedUnits: profileData.assignedUnits,
            foto: profileData.foto, // Ensure photo data is included
        };
        
        // Only include password if it has changed
        if (profileData.password !== initialProfileData.password) {
            payload.password = profileData.password;
        }

        const savedUser = await apiService.saveUser(payload);

        setSaveStatus('saved');
        onProfileUpdate({ name: savedUser.nama });
        
        const newProfileData = { ...profileData, ...savedUser };
        setProfileData(newProfileData);
        setInitialProfileData(newProfileData);
        
        setIsEditing(false);
        setPhotoPreview(null);
        
        setTimeout(() => setSaveStatus('idle'), 2000);
    
    } catch (error) {
        console.error("Failed to save profile:", error);
        alert("Gagal menyimpan profil. Silakan coba lagi."); 
        setSaveStatus('idle');
    }
  };
  
  const handleRequestCorrection = () => {
    if(!correctionRequest.trim()) return alert("Mohon jelaskan koreksi yang Anda minta.");
    alert("Permintaan koreksi terkirim ke Admin UPM. Anda akan dihubungi jika ada pembaruan.");
    setIsCorrectionModalOpen(false);
    setCorrectionRequest('');
  };

  if (!profileData) return <div>Loading profile...</div>;

  const assignedTasks = MOCK_TASKS.filter(t => t.role === profileData.role || (profileData.role === Role.ADMIN_PRODI && t.role === 'Auditee'));
  const hasChanges = isEditing && JSON.stringify(profileData) !== JSON.stringify(initialProfileData);

  const renderInfoField = (label: string, value: string, fieldName: string, type: string = 'text', readOnly: boolean = false) => (
    <div>
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</label>
        {isEditing && !readOnly ? (
            <input 
                type={type} 
                value={value || ''} 
                onChange={e => setProfileData({...profileData, [fieldName]: e.target.value})} 
                className="w-full border-b-2 border-slate-200 focus:border-indigo-500 py-1 font-bold text-sm text-slate-800 bg-transparent outline-none transition-colors"
            />
        ) : (
            <p className="font-bold text-sm text-slate-800 border-b-2 border-transparent py-1">{value}{readOnly && <span className="text-xs text-slate-400 font-medium italic ml-2">(Read-only)</span>}</p>
        )}
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex justify-between items-center">
        <div><h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3"><UserCog/> Profil & Portofolio</h2>
          <p className="text-sm text-slate-500 font-medium">Manajemen akun dan rekam jejak aktivitas audit Anda.</p></div>
        {isEditing ? (
          <div className="flex gap-3">
             <button onClick={handleEditToggle} className="px-6 py-3 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold uppercase">Batal</button>
             <button onClick={handleSave} disabled={!hasChanges || saveStatus === 'saving'} className="px-6 py-3 bg-emerald-600 text-white rounded-xl text-xs font-bold uppercase shadow-lg flex items-center gap-2 disabled:opacity-50 transition-all">
               {saveStatus === 'saving' ? 'Menyimpan...' : <><Save size={16}/> Simpan Profil</>}
             </button>
          </div>
        ) : (
          <button onClick={handleEditToggle} className="px-6 py-3 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg flex items-center gap-2"><Edit size={16}/> Edit Profil</button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-white border border-slate-200 rounded-[1.5rem] p-8 shadow-sm text-center flex flex-col items-center">
            <div className="relative group w-32 h-32 mb-4" onClick={() => isEditing && photoInputRef.current?.click()}>
              <input type="file" ref={photoInputRef} onChange={handlePhotoChange} className="hidden" accept="image/*" />
              <div className="w-full h-full rounded-full overflow-hidden border-8 border-slate-50 shadow-lg bg-slate-100 flex items-center justify-center">
                <img src={photoPreview || profileData.foto || ''} alt={profileData.foto ? 'Foto Profil' : ''} className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                {(!photoPreview && !profileData.foto) && <UserIcon size={48} className="text-slate-300"/>}
              </div>
              {isEditing && <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity"><Camera size={24}/></div>}
            </div>
            <h3 className="text-xl font-black text-slate-900">{profileData.nama}</h3>
            <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-[10px] font-bold uppercase mt-2 inline-block">{profileData.role}</span>
          </div>
          <div className="bg-white border border-slate-200 rounded-[1.5rem] p-6 shadow-sm">
            <h4 className="font-bold text-xs uppercase text-slate-500 mb-4 flex items-center gap-2"><Lock size={16}/> Keamanan Akun</h4>
            <div className="space-y-3">
               <input type="password" placeholder="Password Saat Ini" className="w-full border p-3 rounded-lg text-xs" disabled={!isEditing}/>
               <div className="relative">
                  <input 
                     type={showPassword ? 'text' : 'password'} 
                     placeholder="Password Baru" 
                     className="w-full border p-3 rounded-lg text-xs" 
                     disabled={!isEditing}
                     value={profileData.password || ''}
                     onChange={(e) => setProfileData({...profileData, password: e.target.value})}
                  />
                  {isEditing && (
                    <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                      {showPassword ? <EyeOff size={16}/> : <Eye size={16}/>}
                    </button>
                  )}
               </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white border border-slate-200 rounded-[1.5rem] p-8 shadow-sm">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                {renderInfoField('Nama Lengkap', profileData.nama, 'nama')}
                {renderInfoField('NIP / Username', profileData.nip, 'nip')}
                <div className="md:col-span-2">{renderInfoField('Unit Kerja', currentUser?.unitName || 'Tidak terafiliasi', 'unitName', 'text', true)}</div>
             </div>
          </div>
          
          <div className="bg-white border border-slate-200 rounded-[1.5rem] p-8 shadow-sm">
            <div className="flex justify-between items-start">
              <h4 className="font-bold text-xs uppercase text-slate-500 mb-4 flex items-center gap-2"><Briefcase size={16}/> Peran & Tanggung Jawab</h4>
              {isEditing && <button onClick={() => setIsCorrectionModalOpen(true)} className="text-xs font-bold text-indigo-600 hover:underline">Minta Koreksi</button>}
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
               <h5 className="font-bold text-indigo-700">{profileData.role}</h5>
               <p className="text-xs text-slate-600 mt-1">{ROLE_DESCRIPTIONS[profileData.role as Role]}</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-[1.5rem] p-8 shadow-sm">
            <h4 className="font-bold text-xs uppercase text-slate-500 mb-4 flex items-center gap-2"><ListTodo size={16}/> Tugas yang Diberikan</h4>
            <div className="space-y-3">{assignedTasks.length > 0 ? assignedTasks.map(task => (<div key={task.id} className="p-4 bg-slate-50 rounded-xl flex justify-between items-center"><div><p className="font-bold text-xs text-slate-800">{task.title}</p><p className="text-[10px] text-slate-500">{task.cycle}</p></div><span className={`px-2 py-1 text-[9px] font-bold rounded ${task.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{task.status}</span></div>)) : <p className="text-xs text-slate-400 text-center italic py-4">Tidak ada tugas yang diberikan.</p>}</div>
          </div>
          
          <div className="bg-white border border-slate-200 rounded-[1.5rem] p-8 shadow-sm">
            <div className="flex justify-between items-center mb-6"><h4 className="font-bold text-xs uppercase text-slate-500 flex items-center gap-2"><Activity size={16}/> Portofolio Aktivitas Audit</h4><button className="px-4 py-2 bg-slate-100 rounded-lg text-xs font-bold flex items-center gap-2"><Download size={14}/> Ekspor PDF</button></div>
            <div className="relative space-y-6"><div className="absolute left-5 top-2 bottom-2 w-0.5 bg-slate-100"></div>{portfolioLog.map(log => (<div key={log.id} className="relative z-10 flex items-start gap-4"><div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center border-4 border-white shadow-sm flex-shrink-0 text-indigo-600"><FileSignature size={20}/></div><div><p className="text-xs text-slate-600"><span className="font-bold text-slate-900">{log.action}</span> pada <span className="font-bold text-indigo-600">{log.target}</span></p><p className="text-[10px] font-bold text-slate-400 mt-1">{log.timestamp}</p></div></div>))}</div>
          </div>

        </div>
      </div>
      
      {isCorrectionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50">
           <div className="bg-white rounded-[1.5rem] p-6 w-full max-w-lg shadow-xl">
              <div className="flex justify-between items-center mb-4"><h3 className="font-bold">Permintaan Koreksi Peran/Unit</h3><button onClick={() => setIsCorrectionModalOpen(false)}><X/></button></div>
              <p className="text-xs text-slate-500 mb-4">Jelaskan koreksi yang diperlukan. Permintaan Anda akan dikirim ke Admin UPM untuk ditinjau.</p>
              <textarea value={correctionRequest} onChange={e => setCorrectionRequest(e.target.value)} className="w-full h-24 border p-2 rounded-lg text-sm" placeholder="Contoh: Unit kerja saya seharusnya Prodi Tata Air Pertanian, bukan THP."/>
              <button onClick={handleRequestCorrection} className="w-full mt-4 py-3 bg-indigo-600 text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2"><Send size={16}/> Kirim Permintaan</button>
           </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePortfolioView;