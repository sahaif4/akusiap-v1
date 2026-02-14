import React, { useState, useEffect } from 'react';
import { User, CheckCircle2, Plus, Edit, Trash2, X, Save, Users, Target } from 'lucide-react';
import { CurrentUser, Role, UPMProfile, UPMMember, UPMProgram, UPMDivision, UPMMemberRole } from '../types';
import * as apiService from '../services/apiService';

interface Props {
    currentUser: CurrentUser | null;
}

const UPMStructureView: React.FC<Props> = ({ currentUser }) => {
    const isUPMAdmin = currentUser?.role === Role.ADMIN_UPM || currentUser?.role === Role.SUPER_ADMIN;
    
    const [profile, setProfile] = useState<UPMProfile | null>(null);
    const [members, setMembers] = useState<UPMMember[]>([]);
    const [programs, setPrograms] = useState<UPMProgram[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal States
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [editingProfile, setEditingProfile] = useState<Partial<UPMProfile> | null>(null);
    const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
    const [editingMember, setEditingMember] = useState<Partial<UPMMember> | null>(null);
    const [isProgramModalOpen, setIsProgramModalOpen] = useState(false);
    const [editingProgram, setEditingProgram] = useState<Partial<UPMProgram> | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const profiles = await apiService.getUPMProfiles();
            if (profiles.length > 0) setProfile(profiles[0]);
            
            const membersData = await apiService.getUPMMembers();
            setMembers(membersData);

            const programsData = await apiService.getUPMPrograms();
            setPrograms(programsData);
        } catch (e) {
            console.error("Failed to load structure data", e);
        } finally {
            setLoading(false);
        }
    };

    // --- HANDLERS ---

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingProfile) return;
        
        try {
            await apiService.saveUPMProfile(editingProfile);
            setIsProfileModalOpen(false);
            setEditingProfile(null);
            loadData();
        } catch (e) { alert("Gagal menyimpan profil"); }
    };

    const handleSaveMember = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingMember || !profile) return;
        
        try {
            await apiService.saveUPMMember({ ...editingMember, profile: profile.id });
            setIsMemberModalOpen(false);
            setEditingMember(null);
            loadData();
        } catch (e) { alert("Gagal menyimpan anggota"); }
    };

    const handleDeleteMember = async (id: number) => {
        if (!confirm("Hapus anggota ini?")) return;
        try {
            await apiService.deleteUPMMember(id);
            loadData();
        } catch (e) { alert("Gagal menghapus anggota"); }
    };

    const handleSaveProgram = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingProgram || !profile) return;

        try {
            await apiService.saveUPMProgram({ ...editingProgram, profile: profile.id });
            setIsProgramModalOpen(false);
            setEditingProgram(null);
            loadData();
        } catch (e: any) { alert(`Gagal menyimpan fungsi/program: ${e.message}`); }
    };

    const handleDeleteProgram = async (id: number) => {
        if (!confirm("Hapus item ini?")) return;
        try {
            await apiService.deleteUPMProgram(id);
            loadData();
        } catch (e) { alert("Gagal menghapus item"); }
    };

    // --- RENDER HELPERS ---

    const getMemberByRole = (role: UPMMemberRole) => members.find(m => m.role === role);
    const getMembersByDivision = (div: UPMDivision) => members.filter(m => m.division === div);

    const ketua = getMemberByRole(UPMMemberRole.KETUA);
    const sekretaris = getMemberByRole(UPMMemberRole.SEKRETARIS);

    if (loading) return <div className="p-8 text-center text-slate-500">Memuat struktur organisasi...</div>;

    if (!profile && isUPMAdmin) {
        return (
            <div className="p-8 text-center">
                <p className="mb-4">Belum ada Profil UPM.</p>
                <button onClick={async () => {
                    await apiService.saveUPMProfile({ name: 'Unit Penjaminan Mutu', is_active: true, description: '', vision: '', mission: '' });
                    loadData();
                }} className="px-4 py-2 bg-indigo-600 text-white rounded-lg">Inisialisasi Profil</button>
            </div>
        )
    }

    if (!profile) return <div className="p-8 text-center text-slate-500">Data struktur belum tersedia.</div>;

    return (
        <div className="space-y-12 animate-in fade-in duration-500 pb-20">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Struktur Organisasi & Tugas</h2>
                    <p className="text-sm text-slate-500 font-medium">Susunan tim kerja dan mandat operasional UPM.</p>
                </div>
                {isUPMAdmin && profile && (
                    <button onClick={() => { setEditingProfile(profile); setIsProfileModalOpen(true); }} className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-50 transition-colors shadow-sm flex items-center gap-2">
                        <Edit size={16}/> Edit Profil
                    </button>
                )}
            </div>

            {/* Leadership Section */}
            <section>
                <div className="text-center mb-10">
                    <h3 className="text-2xl font-black text-slate-900">Pimpinan UPM</h3>
                    <p className="text-sm text-slate-500">Penanggung jawab utama sistem penjaminan mutu.</p>
                </div>
                <div className="flex flex-col items-center gap-6">
                    {/* KETUA */}
                    <div className="relative group w-full max-w-2xl">
                        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-lg text-center flex flex-col items-center">
                            <div className="w-24 h-24 bg-indigo-100 rounded-full mb-4 flex items-center justify-center border-4 border-white"><User size={48} className="text-indigo-400"/></div>
                            <span className="px-3 py-1 bg-indigo-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest">Ketua UPM</span>
                            <h4 className="text-xl font-bold text-slate-900 mt-3">{ketua?.name || 'Belum diisi'}</h4>
                            <p className="text-xs text-slate-400 font-mono mb-4">NIP. {ketua?.nip || '-'}</p>
                            {ketua?.description && (
                                <div className="w-full bg-slate-50 p-4 rounded-xl border border-slate-100 text-left">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Fungsi & Tanggung Jawab</p>
                                    <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{ketua.description}</p>
                                </div>
                            )}
                        </div>
                        {isUPMAdmin && (
                            <button onClick={() => { setEditingMember(ketua || { role: UPMMemberRole.KETUA, division: UPMDivision.PIMPINAN, profile: profile.id }); setIsMemberModalOpen(true); }} 
                                    className="absolute top-4 right-4 p-2 bg-slate-100 rounded-full text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Edit size={16}/>
                            </button>
                        )}
                    </div>

                    <div className="w-1 h-6 bg-slate-200"></div>

                    {/* SEKRETARIS */}
                    <div className="relative group w-full max-w-2xl">
                        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-md text-center flex flex-col items-center">
                             <div className="w-16 h-16 bg-slate-100 rounded-full mb-3 flex items-center justify-center border-4 border-white"><User size={32} className="text-slate-400"/></div>
                            <span className="px-3 py-1 bg-slate-200 text-slate-600 rounded-full text-[9px] font-bold uppercase tracking-wider">Sekretaris UPM</span>
                            <h4 className="text-md font-bold text-slate-800 mt-2">{sekretaris?.name || 'Belum diisi'}</h4>
                            <p className="text-xs text-slate-400 font-mono mb-4">NIP. {sekretaris?.nip || '-'}</p>
                            {sekretaris?.description && (
                                <div className="w-full bg-slate-50 p-4 rounded-xl border border-slate-100 text-left">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Fungsi & Tanggung Jawab</p>
                                    <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{sekretaris.description}</p>
                                </div>
                            )}
                        </div>
                        {isUPMAdmin && (
                            <button onClick={() => { setEditingMember(sekretaris || { role: UPMMemberRole.SEKRETARIS, division: UPMDivision.PIMPINAN, profile: profile.id }); setIsMemberModalOpen(true); }} 
                                    className="absolute top-4 right-4 p-2 bg-slate-100 rounded-full text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Edit size={16}/>
                            </button>
                        )}
                    </div>
                </div>
            </section>
            
            {/* Team Structure */}
            <section>
                <div className="text-center mb-10">
                    <div className="flex items-center justify-center gap-3 mb-2">
                        <h3 className="text-2xl font-black text-slate-900">Tim Kerja & Pembagian Tugas</h3>
                    </div>
                    <p className="text-sm text-slate-500">Struktur koordinator unit dan tim pendukung.</p>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {[UPMDivision.MUTU, UPMDivision.MONEV, UPMDivision.TUK].map(div => {
                        const divMembers = getMembersByDivision(div);
                        const koordinator = divMembers.find(m => m.role === UPMMemberRole.KOORDINATOR);
                        const anggotas = divMembers.filter(m => m.role === UPMMemberRole.ANGGOTA);
                        
                        const divNames: any = {
                            [UPMDivision.MUTU]: 'Manajemen Mutu & Akreditasi',
                            [UPMDivision.MONEV]: 'Monitoring & Evaluasi',
                            [UPMDivision.TUK]: 'Tempat Uji Kompetensi'
                        };

                        return (
                            <div key={div} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col group relative">
                                <h4 className="font-black text-indigo-800 text-md uppercase tracking-wider mb-4 pb-4 border-b border-slate-200">{divNames[div]}</h4>
                                <div className="space-y-6 flex-1">
                                    {/* Koordinator Section */}
                                    <div className="relative group/coord">
                                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Koordinator</p>
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900">{koordinator?.name || '-'}</p>
                                                    {koordinator?.description && (
                                                        <p className="text-xs text-slate-500 mt-2 leading-relaxed bg-white p-2 rounded-lg border border-slate-100 italic">
                                                            "{koordinator.description}"
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        {isUPMAdmin && koordinator && (
                                            <button onClick={() => { setEditingMember(koordinator); setIsMemberModalOpen(true); }} className="absolute top-2 right-2 opacity-0 group-hover/coord:opacity-100 p-2 bg-white shadow rounded-full text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all"><Edit size={12}/></button>
                                        )}
                                        {isUPMAdmin && !koordinator && (
                                            <button onClick={() => { setEditingMember({ role: UPMMemberRole.KOORDINATOR, division: div, profile: profile.id }); setIsMemberModalOpen(true); }} className="absolute top-4 right-4 text-[10px] bg-indigo-50 text-indigo-600 px-2 py-1 rounded-lg font-bold hover:bg-indigo-100 transition-colors">+ Set Koordinator</button>
                                        )}
                                    </div>

                                    {/* Anggota Section */}
                                    <div>
                                        <div className="flex justify-between items-center mb-3">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Anggota Tim</p>
                                            {isUPMAdmin && (
                                                <button onClick={() => { setEditingMember({ role: UPMMemberRole.ANGGOTA, division: div, profile: profile.id }); setIsMemberModalOpen(true); }} className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors"><Plus size={12}/></button>
                                            )}
                                        </div>
                                        {anggotas.length > 0 ? (
                                            <ul className="space-y-3">
                                                {anggotas.map((m) => (
                                                    <li key={m.id} className="relative group/item bg-slate-50 p-3 rounded-xl border border-slate-100">
                                                        <div className="flex justify-between items-start">
                                                            <div>
                                                                <span className="text-xs font-bold text-slate-700 block">{m.name}</span>
                                                                {m.description && <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">{m.description}</p>}
                                                            </div>
                                                            {isUPMAdmin && (
                                                                <div className="flex gap-1 opacity-0 group-hover/item:opacity-100 absolute top-2 right-2 bg-white shadow-sm p-1 rounded-lg">
                                                                    <button onClick={() => { setEditingMember(m); setIsMemberModalOpen(true); }} className="p-1 text-indigo-600 hover:bg-indigo-50 rounded"><Edit size={10}/></button>
                                                                    <button onClick={() => handleDeleteMember(m.id)} className="p-1 text-rose-600 hover:bg-rose-50 rounded"><Trash2 size={10}/></button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="text-xs text-slate-400 italic text-center py-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">Belum ada anggota.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* PROFILE MODAL */}
            {isProfileModalOpen && editingProfile && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-2xl shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-lg text-slate-900">Edit Profil & SK Organisasi</h3>
                            <button onClick={() => setIsProfileModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
                        </div>
                        <form onSubmit={handleSaveProfile} className="space-y-5">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Nama Unit</label>
                                <input required className="w-full p-3 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none" value={editingProfile.name || ''} onChange={e => setEditingProfile({...editingProfile, name: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Nomor SK / Dasar Hukum</label>
                                <input className="w-full p-3 border border-slate-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-indigo-500 outline-none" value={editingProfile.description || ''} onChange={e => setEditingProfile({...editingProfile, description: e.target.value})} placeholder="Contoh: SK Direktur No. 123/Tahun 2026" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Visi</label>
                                    <textarea className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none h-32 resize-none" value={editingProfile.vision || ''} onChange={e => setEditingProfile({...editingProfile, vision: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Misi</label>
                                    <textarea className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none h-32 resize-none" value={editingProfile.mission || ''} onChange={e => setEditingProfile({...editingProfile, mission: e.target.value})} />
                                </div>
                            </div>
                            <div className="flex justify-end pt-4 border-t border-slate-100">
                                <button type="submit" className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors shadow-lg flex items-center gap-2"><Save size={16}/> Simpan Perubahan</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MEMBER MODAL */}
            {isMemberModalOpen && editingMember && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg">Edit Anggota Tim</h3>
                            <button onClick={() => setIsMemberModalOpen(false)}><X size={20}/></button>
                        </div>
                        <form onSubmit={handleSaveMember} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Nama Lengkap</label>
                                <input required className="w-full p-2 border rounded-lg" value={editingMember.name || ''} onChange={e => setEditingMember({...editingMember, name: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">NIP</label>
                                <input className="w-full p-2 border rounded-lg" value={editingMember.nip || ''} onChange={e => setEditingMember({...editingMember, nip: e.target.value})} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Peran</label>
                                    <select className="w-full p-2 border rounded-lg" value={editingMember.role} onChange={e => setEditingMember({...editingMember, role: e.target.value as UPMMemberRole})}>
                                        {Object.values(UPMMemberRole).map(r => <option key={r} value={r}>{r}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Divisi</label>
                                    <select className="w-full p-2 border rounded-lg" value={editingMember.division} onChange={e => setEditingMember({...editingMember, division: e.target.value as UPMDivision})}>
                                        {Object.values(UPMDivision).map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Uraian Tugas / Job Description</label>
                                <textarea className="w-full p-2 border rounded-lg h-24 text-sm" value={editingMember.description || ''} onChange={e => setEditingMember({...editingMember, description: e.target.value})} placeholder="Tuliskan tugas dan tanggung jawab..." />
                            </div>
                            <div className="flex justify-end pt-4">
                                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold text-xs">Simpan</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* PROGRAM MODAL */}
            {isProgramModalOpen && editingProgram && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg">Edit Fungsi / Tugas</h3>
                            <button onClick={() => setIsProgramModalOpen(false)}><X size={20}/></button>
                        </div>
                        <form onSubmit={handleSaveProgram} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Deskripsi Tugas</label>
                                <textarea required className="w-full p-2 border rounded-lg h-32" value={editingProgram.name || ''} onChange={e => setEditingProgram({...editingProgram, name: e.target.value})} />
                            </div>
                            <div className="flex justify-end pt-4">
                                <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-bold text-xs">Simpan</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UPMStructureView;