import React, { useState, useEffect } from 'react';
import { Settings, Users, FileText, CheckCircle, Clock, PlayCircle, BarChart2, Plus, Trash2, Edit, Save, X, Target, Database, BookOpen, ChevronDown, Calendar, MapPin } from 'lucide-react';
import { Standard, User, Unit, Role, StandardDocument, UPMAgenda } from '../types';
import * as apiService from '../services/apiService';
import { API_BASE_URL } from '../services/apiService';

// --- Internal Components Definitions ---

const RoadmapManager = () => {
    const [roadmaps, setRoadmaps] = useState<UPMAgenda[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Partial<UPMAgenda> | null>(null);

    const loadRoadmaps = async () => {
        try {
            const data = await apiService.getUPMAgendas();
            // Filter only roadmap type and sort by date
            setRoadmaps(data.filter(d => d.agenda_type === 'roadmap').sort((a,b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime()));
        } catch (e) {
            console.error("Failed to load roadmaps", e);
        }
    };

    useEffect(() => {
        loadRoadmaps();
    }, []);

    const handleDelete = async (id: number) => {
        if(!confirm("Hapus item roadmap ini?")) return;
        try {
            await apiService.deleteUPMAgenda(id);
            setRoadmaps(prev => prev.filter(r => r.id !== id));
        } catch(e) { alert("Gagal menghapus"); }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!editingItem) return;
        
        try {
            const payload = {
                ...editingItem,
                agenda_type: 'roadmap' as const
            };
            await apiService.saveUPMAgenda(payload);
            setIsModalOpen(false);
            setEditingItem(null);
            loadRoadmaps();
        } catch(e) { alert("Gagal menyimpan"); }
    };

    const openEdit = (item: UPMAgenda) => {
        setEditingItem(item);
        setIsModalOpen(true);
    };

    const openCreate = () => {
        setEditingItem({
            title: '',
            description: '',
            start_date: new Date().toISOString().split('T')[0],
            status: 'planned',
            responsible_unit: '',
            agenda_type: 'roadmap'
        });
        setIsModalOpen(true);
    };

    return (
        <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm">
             <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2"><MapPin size={20} className="text-amber-600"/> Peta Jalan Akreditasi (Roadmap)</h3>
                <button onClick={openCreate} className="px-4 py-2 bg-amber-600 text-white rounded-lg text-xs font-bold shadow flex items-center gap-2 hover:bg-amber-700 transition-colors"><Plus size={14}/> Tambah Agenda</button>
             </div>

             <div className="space-y-4">
                {roadmaps.map(item => (
                    <div key={item.id} className="flex items-center gap-4 p-4 bg-slate-50 border border-slate-100 rounded-2xl relative group hover:shadow-md transition-all">
                        <div className={`w-2 h-16 rounded-full flex-shrink-0 ${item.status === 'done' ? 'bg-emerald-500' : item.status === 'ongoing' ? 'bg-blue-500' : 'bg-slate-300'}`}></div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{new Date(item.start_date).toLocaleDateString('id-ID', {month:'long', year:'numeric'})}</span>
                                <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${
                                    item.status === 'done' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 
                                    item.status === 'ongoing' ? 'bg-blue-100 text-blue-700 border-blue-200' : 
                                    'bg-slate-100 text-slate-600 border-slate-200'
                                }`}>{item.status === 'done' ? 'Selesai' : item.status === 'ongoing' ? 'Berjalan' : 'Belum Dimulai'}</span>
                            </div>
                            <h4 className="font-bold text-slate-800 truncate">{item.title}</h4>
                            <p className="text-xs text-slate-500 mt-1 truncate">PIC: {item.responsible_unit}</p>
                        </div>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity absolute right-4 top-4 bg-white/80 p-1 rounded-lg backdrop-blur-sm">
                            <button onClick={() => openEdit(item)} className="p-2 bg-white border border-slate-200 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors shadow-sm"><Edit size={14}/></button>
                            <button onClick={() => handleDelete(item.id)} className="p-2 bg-white border border-slate-200 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors shadow-sm"><Trash2 size={14}/></button>
                        </div>
                    </div>
                ))}
                {roadmaps.length === 0 && <div className="text-center p-8 text-slate-400 italic border-2 border-dashed border-slate-200 rounded-2xl">Belum ada agenda roadmap yang dibuat.</div>}
             </div>

             {isModalOpen && editingItem && (
                 <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
                     <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
                         <h3 className="font-bold text-lg mb-4 text-slate-800">{editingItem.id ? 'Edit Agenda Roadmap' : 'Buat Agenda Roadmap'}</h3>
                         <form onSubmit={handleSave} className="space-y-4">
                             <div>
                                 <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Judul Kegiatan</label>
                                 <input required className="w-full p-3 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-amber-500 outline-none" value={editingItem.title} onChange={e => setEditingItem({...editingItem, title: e.target.value})} placeholder="Contoh: Penyusunan LED"/>
                             </div>
                             <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Target Waktu</label>
                                    <input type="date" required className="w-full p-3 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-amber-500 outline-none" value={editingItem.start_date} onChange={e => setEditingItem({...editingItem, start_date: e.target.value})}/>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Status</label>
                                    <select className="w-full p-3 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-amber-500 outline-none" value={editingItem.status} onChange={e => setEditingItem({...editingItem, status: e.target.value as any})}>
                                        <option value="planned">Belum Dimulai</option>
                                        <option value="ongoing">Sedang Berjalan</option>
                                        <option value="done">Selesai</option>
                                    </select>
                                </div>
                             </div>
                             <div>
                                 <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Penanggung Jawab (PIC)</label>
                                 <input className="w-full p-3 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-amber-500 outline-none" value={editingItem.responsible_unit} onChange={e => setEditingItem({...editingItem, responsible_unit: e.target.value})} placeholder="Contoh: Tim Akreditasi"/>
                             </div>
                             <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                                 <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200 transition-colors">Batal</button>
                                 <button type="submit" className="px-4 py-2 bg-amber-600 text-white rounded-xl text-xs font-bold hover:bg-amber-700 shadow-lg shadow-amber-200 transition-colors">Simpan</button>
                             </div>
                         </form>
                     </div>
                 </div>
             )}
        </div>
    );
};

const CreateCycleModal = ({ onClose, onSave, initialData }: any) => {
    const [formData, setFormData] = useState(initialData || { name: '', start_date: '', end_date: '', status: 'Perencanaan' });
    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSave(formData); };
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
                <h3 className="text-lg font-bold mb-4">{initialData ? 'Edit Siklus Audit' : 'Buat Siklus Audit Baru'}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div><label className="block text-sm font-medium mb-1">Nama Siklus</label><input required className="w-full p-2 border rounded-lg" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Contoh: AMI 2024/2025" /></div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="block text-sm font-medium mb-1">Mulai</label><input type="date" required className="w-full p-2 border rounded-lg" value={formData.start_date} onChange={e => setFormData({...formData, start_date: e.target.value})} /></div>
                        <div><label className="block text-sm font-medium mb-1">Selesai</label><input type="date" required className="w-full p-2 border rounded-lg" value={formData.end_date} onChange={e => setFormData({...formData, end_date: e.target.value})} /></div>
                    </div>
                    <div><label className="block text-sm font-medium mb-1">Status</label>
                        <select className="w-full p-2 border rounded-lg" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                            <option value="Perencanaan">Perencanaan</option><option value="Aktif">Aktif</option><option value="Selesai">Selesai</option>
                        </select>
                    </div>
                    <div className="flex justify-end gap-2 mt-6"><button type="button" onClick={onClose} className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-lg">Batal</button><button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700">Simpan</button></div>
                </form>
            </div>
        </div>
    );
};

const AssignAuditorModal = ({ onClose, onSave, allCycles, allUnits, allAuditors, initialData }: any) => {
    const [formData, setFormData] = useState(initialData || { audit_cycle: '', unit: '', auditor1: '', auditor2: '' });
    
    // Convert IDs to strings for select values to avoid warnings
    const safeFormData = {
        ...formData,
        audit_cycle: String(formData.audit_cycle || ''),
        unit: String(formData.unit || ''),
        auditor1: String(formData.auditor1 || ''),
        auditor2: String(formData.auditor2 || '')
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await apiService.saveAuditAssignment({
                ...formData,
                id: initialData?.id, // Preserve ID if editing
                audit_cycle: parseInt(safeFormData.audit_cycle),
                unit: parseInt(safeFormData.unit),
                auditor1: parseInt(safeFormData.auditor1),
                auditor2: parseInt(safeFormData.auditor2)
            });
            onSave();
        } catch (error) { alert("Gagal menyimpan penugasan"); }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl">
                <h3 className="text-lg font-bold mb-4">{initialData ? 'Edit Penugasan' : 'Tugaskan Auditor'}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div><label className="block text-sm font-medium mb-1">Siklus Audit</label>
                        <select required className="w-full p-2 border rounded-lg" value={safeFormData.audit_cycle} onChange={e => setFormData({...formData, audit_cycle: e.target.value})}>
                            <option value="">Pilih Siklus...</option>{allCycles.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div><label className="block text-sm font-medium mb-1">Unit / Prodi</label>
                        <select required className="w-full p-2 border rounded-lg" value={safeFormData.unit} onChange={e => setFormData({...formData, unit: e.target.value})}>
                            <option value="">Pilih Unit...</option>{allUnits.map((u: Unit) => <option key={u.id} value={u.id}>{u.nama_unit}</option>)}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="block text-sm font-medium mb-1">Auditor 1 (Ketua)</label>
                            <select required className="w-full p-2 border rounded-lg" value={safeFormData.auditor1} onChange={e => setFormData({...formData, auditor1: e.target.value})}>
                                <option value="">Pilih Auditor...</option>{allAuditors.map((u: User) => <option key={u.id} value={u.id}>{u.nama}</option>)}
                            </select>
                        </div>
                        <div><label className="block text-sm font-medium mb-1">Auditor 2 (Anggota)</label>
                            <select required className="w-full p-2 border rounded-lg" value={safeFormData.auditor2} onChange={e => setFormData({...formData, auditor2: e.target.value})}>
                                <option value="">Pilih Auditor...</option>{allAuditors.map((u: User) => <option key={u.id} value={u.id}>{u.nama}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-6"><button type="button" onClick={onClose} className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-lg">Batal</button><button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700">Simpan</button></div>
                </form>
            </div>
        </div>
    );
};

const AddStandardDocModal = ({ onClose, onSave }: any) => {
    const [formData, setFormData] = useState({ nama_dokumen: '', kategori: 'Pedoman', file: null as File | null });
    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSave(formData); };
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
                <h3 className="text-lg font-bold mb-4">Upload Dokumen Standar</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div><label className="block text-sm font-medium mb-1">Nama Dokumen</label><input required className="w-full p-2 border rounded-lg" value={formData.nama_dokumen} onChange={e => setFormData({...formData, nama_dokumen: e.target.value})} /></div>
                    <div><label className="block text-sm font-medium mb-1">Kategori</label>
                        <select className="w-full p-2 border rounded-lg" value={formData.kategori} onChange={e => setFormData({...formData, kategori: e.target.value})}>
                            <option value="Pedoman">Pedoman</option><option value="SK">SK</option><option value="Instruksi Kerja">Instruksi Kerja</option><option value="Formulir">Formulir</option>
                        </select>
                    </div>
                    <div><label className="block text-sm font-medium mb-1">File Dokumen</label><input type="file" required className="w-full p-2 border rounded-lg" onChange={e => setFormData({...formData, file: e.target.files ? e.target.files[0] : null})} /></div>
                    <div className="flex justify-end gap-2 mt-6"><button type="button" onClick={onClose} className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-lg">Batal</button><button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700">Upload</button></div>
                </form>
            </div>
        </div>
    );
};

const InstrumentBankManager = () => {
    const [bankType, setBankType] = useState<'standar' | 'unggul'>('standar');
    const [standards, setStandards] = useState<Standard[]>([]);
    const [bank, setBank] = useState<Record<string, any[]>>({});
    const [selectedStandard, setSelectedStandard] = useState<string>('');
    const [editingItem, setEditingItem] = useState<any | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [stds, bn_] = await Promise.all([apiService.getStandards(bankType), apiService.getInstrumentBank(bankType)]);
                setStandards(stds);
                setBank(bn_);
                if (stds.length > 0) setSelectedStandard(stds[0].kode_standar);
                else setSelectedStandard('');
            } catch (error) {
                console.error("Failed to fetch instrument bank:", error);
            }
        };
        fetchData();
    }, [bankType]);

    const handleSaveItem = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedStandard) return;
        const currentItems = bank[selectedStandard] || [];
        let newItems;
        if (editingItem.id) {
            newItems = currentItems.map(item => item.id === editingItem.id ? editingItem : item);
        } else {
            newItems = [...currentItems, { ...editingItem, id: Date.now() }];
        }
        const newBank = { ...bank, [selectedStandard]: newItems };
        setBank(newBank);
        await apiService.saveInstrumentBank(newBank, bankType);
        setEditingItem(null);
    };

    const handleDeleteItem = async (id: number) => {
        if(!confirm("Hapus pertanyaan ini?")) return;
        const currentItems = bank[selectedStandard] || [];
        const newItems = currentItems.filter(item => item.id !== id);
        const newBank = { ...bank, [selectedStandard]: newItems };
        setBank(newBank);
        await apiService.saveInstrumentBank(newBank, bankType);
    };

    return (
        <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm">
             <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2"><Database size={20} className="text-blue-600"/> Bank Instrumen & Pertanyaan</h3>
                <div className="flex bg-slate-100 p-1 rounded-lg">
                    <button onClick={() => setBankType('standar')} className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${bankType === 'standar' ? 'bg-white shadow text-blue-700' : 'text-slate-500'}`}>Standar PEPI</button>
                    <button onClick={() => setBankType('unggul')} className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${bankType === 'unggul' ? 'bg-white shadow text-blue-700' : 'text-slate-500'}`}>Instrumen Unggul</button>
                </div>
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-1 space-y-2 max-h-[400px] overflow-y-auto">
                    {standards.map(std => (
                        <button key={std.id} onClick={() => setSelectedStandard(std.kode_standar)} 
                            className={`w-full text-left p-3 rounded-xl text-xs font-bold transition-colors ${selectedStandard === std.kode_standar ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'hover:bg-slate-50 text-slate-600 border border-transparent'}`}>
                            {std.kode_standar} - {std.nama_standar}
                        </button>
                    ))}
                </div>
                <div className="lg:col-span-3">
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="font-bold text-slate-800">Daftar Pertanyaan ({selectedStandard})</h4>
                        <button onClick={() => setEditingItem({ id: 0, q: '', proof: '' })} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-blue-700 transition-colors"><Plus size={12}/> Tambah Pertanyaan</button>
                    </div>
                    
                    {editingItem && (
                        <div className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-200 animate-in fade-in">
                            <form onSubmit={handleSaveItem} className="space-y-3">
                                <div><label className="text-xs font-bold text-slate-500">Pertanyaan</label><textarea required className="w-full p-2 border rounded-lg text-sm" rows={2} value={editingItem.q} onChange={e => setEditingItem({...editingItem, q: e.target.value})} /></div>
                                <div><label className="text-xs font-bold text-slate-500">Bukti Dukung Wajib</label><input required className="w-full p-2 border rounded-lg text-sm" value={editingItem.proof} onChange={e => setEditingItem({...editingItem, proof: e.target.value})} /></div>
                                <div className="flex justify-end gap-2">
                                    <button type="button" onClick={() => setEditingItem(null)} className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded">Batal</button>
                                    <button type="submit" className="px-3 py-1.5 text-xs font-bold bg-blue-600 text-white rounded-lg hover:bg-blue-700">Simpan</button>
                                </div>
                            </form>
                        </div>
                    )}

                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                        {bank[selectedStandard]?.length === 0 ? (
                            <div className="text-center p-8 text-slate-400 text-sm italic border-2 border-dashed rounded-xl">Belum ada pertanyaan untuk standar ini.</div>
                        ) : (
                            bank[selectedStandard]?.map((item, idx) => (
                                <div key={item.id || idx} className="p-4 bg-white border border-slate-100 rounded-xl hover:border-blue-200 transition-colors group shadow-sm">
                                    <div className="flex justify-between items-start gap-4">
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium text-slate-800">{item.q}</p>
                                            <p className="text-xs text-slate-500"><span className="font-bold">Bukti:</span> {item.proof}</p>
                                        </div>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => setEditingItem(item)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"><Edit size={14}/></button>
                                            <button onClick={() => handleDeleteItem(item.id)} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded"><Trash2 size={14}/></button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
             </div>
        </div>
    );
};

// --- Main Component ---

const UPMAdminView: React.FC = () => {
    const [cycles, setCycles] = useState<any[]>([]);
    const [assignments, setAssignments] = useState<any[]>([]);
    const [documents, setDocuments] = useState<StandardDocument[]>([]);
    const [allUnits, setAllUnits] = useState<Unit[]>([]);
    const [allAuditors, setAllAuditors] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [isCycleModalOpen, setIsCycleModalOpen] = useState(false);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [editingAssignment, setEditingAssignment] = useState<any | null>(null);
    const [isDocModalOpen, setIsDocModalOpen] = useState(false);

    // Calculate active assignments for each auditor
    const getActiveAssignmentsCount = (auditorId: number) => {
        if (!Array.isArray(assignments)) return 0;
        return assignments.filter(a => 
            a.auditor1 === auditorId || a.auditor2 === auditorId
        ).length;
    };

    const auditorsWithStats = allAuditors.map(auditor => ({
        ...auditor,
        activeAssignments: getActiveAssignmentsCount(auditor.id)
    }));

    useEffect(() => {
        const fetchMasterData = async () => {
            try {
                setLoading(true);
                const [units, users, cyclesData, assignmentsData, documentsData] = await Promise.all([
                    apiService.getUnits(),
                    apiService.getUsers(),
                    apiService.getAuditCycles(),
                    apiService.getAuditAssignments(),
                    apiService.getStandardDocuments()
                ]);
                setAllUnits(units);
                setAllAuditors(users.filter(u => u.role === Role.AUDITOR));
                setCycles(cyclesData);
                setAssignments(assignmentsData);
                setDocuments(documentsData);
            } catch (err: any) {
                console.error("Failed to load workspace data:", err);
                setError("Gagal memuat data workspace. Silakan coba muat ulang halaman.");
            } finally {
                setLoading(false);
            }
        };
        fetchMasterData();
    }, []);

    const handleCreateCycle = async (newCycle: any) => {
        try {
            const savedCycle = await apiService.saveAuditCycle(newCycle);
            // If editing, replace. If creating, prepend.
            if (newCycle.id) {
                setCycles(prev => prev.map(c => c.id === savedCycle.id ? savedCycle : c));
            } else {
                setCycles(prev => [savedCycle, ...prev]);
            }
            setIsCycleModalOpen(false);
            setEditingCycle(null);
        } catch (error) {
            alert('Gagal menyimpan siklus audit.');
        }
    };

    const handleDeleteCycle = async (id: number) => {
        if (!confirm("Hapus siklus audit ini?")) return;
        try {
            await apiService.deleteAuditCycle(id);
            setCycles(prev => prev.filter(c => c.id !== id));
        } catch (error) {
            alert('Gagal menghapus siklus audit.');
        }
    };

    const handleToggleCycleActive = async (cycle: any) => {
        try {
            // Toggle logic: If setting to 'Aktif', set others to 'Perencanaan' or 'Selesai' if needed, 
            // but usually we just update the specific cycle status.
            // For simplicity, just toggle between 'Aktif' and 'Selesai' or just update status via edit.
            // Let's implement a quick status toggle to 'Aktif' if not active, or 'Selesai' if active.
            const newStatus = cycle.status === 'Aktif' ? 'Selesai' : 'Aktif';
            const updatedCycle = { ...cycle, status: newStatus };
            await apiService.saveAuditCycle(updatedCycle);
            setCycles(prev => prev.map(c => c.id === cycle.id ? updatedCycle : c));
        } catch (error) {
            alert('Gagal mengubah status siklus.');
        }
    };

    const [editingCycle, setEditingCycle] = useState<any | null>(null);

    const handleAssignAuditor = async () => {
        // Refresh assignments
        const assignmentsData = await apiService.getAuditAssignments();
        setAssignments(assignmentsData);
        setIsAssignModalOpen(false);
        setEditingAssignment(null);
    };

    const handleEditAssignment = (assignment: any) => {
        setEditingAssignment(assignment);
        setIsAssignModalOpen(true);
    };

    const handleDeleteAssignment = async (id: number) => {
        if (!confirm('Apakah Anda yakin ingin menghapus penugasan ini? Tindakan ini mungkin mempengaruhi data penilaian yang sudah masuk.')) return;
        try {
            await apiService.deleteAuditAssignment(id);
            setAssignments(prev => prev.filter(a => a.id !== id));
        } catch (error) {
            alert('Gagal menghapus penugasan.');
        }
    };
    
    const handleAddDocument = async (newDoc: Partial<StandardDocument>) => {
        try {
            const savedDoc = await apiService.saveStandardDocument(newDoc);
            setDocuments(prev => [savedDoc, ...prev]);
            setIsDocModalOpen(false);
        } catch (error) {
            alert('Gagal menyimpan dokumen standar.');
        }
    };

  if (loading) {
      return <div className="p-8 text-center text-slate-500">Memuat data workspace...</div>;
  }

  if (error) {
      return <div className="p-8 text-center text-red-500 bg-red-50 rounded-xl border border-red-200">{error}</div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Workspace Admin UPM</h2>
          <p className="text-sm text-slate-500 font-medium">Panel kontrol untuk manajemen siklus, auditor, dan dokumen standar.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2"><Settings size={20} className="text-indigo-600"/> Manajemen Siklus Audit</h3>
              <button onClick={() => { setEditingCycle(null); setIsCycleModalOpen(true); }} className="px-5 py-2.5 bg-indigo-600 text-white rounded-full text-xs font-bold shadow-lg flex items-center gap-2 hover:bg-indigo-700 transition-colors"><Plus size={14}/> Buat Siklus Baru</button>
            </div>
            <div className="space-y-4">
              {cycles.map(cycle => (
                <div key={cycle.id} className="bg-slate-50 border border-slate-100 p-4 rounded-2xl relative group hover:shadow-md transition-all">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {cycle.status === 'Aktif' && <PlayCircle size={14} className="text-emerald-500"/>}
                        {cycle.status === 'Selesai' && <CheckCircle size={14} className="text-slate-400"/>}
                        {cycle.status === 'Perencanaan' && <Clock size={14} className="text-amber-500"/>}
                        <h4 className="font-bold text-slate-800 text-sm">{cycle.name}</h4>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500" style={{width: `${cycle.progress}%`}} />
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-2xl font-black text-indigo-700">{cycle.progress}%</p>
                      <p className="text-[10px] font-bold text-slate-400">{new Date(cycle.start_date).toLocaleDateString()} - {new Date(cycle.end_date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity absolute right-4 top-4 bg-white/80 p-1 rounded-lg backdrop-blur-sm">
                      <button onClick={() => handleToggleCycleActive(cycle)} className={`p-2 bg-white border border-slate-200 rounded-lg transition-colors shadow-sm ${cycle.status === 'Aktif' ? 'text-emerald-600 hover:bg-emerald-50' : 'text-slate-400 hover:bg-slate-50'}`} title={cycle.status === 'Aktif' ? 'Nonaktifkan' : 'Aktifkan'}><PlayCircle size={14}/></button>
                      <button onClick={() => { setEditingCycle(cycle); setIsCycleModalOpen(true); }} className="p-2 bg-white border border-slate-200 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors shadow-sm"><Edit size={14}/></button>
                      <button onClick={() => handleDeleteCycle(cycle.id)} className="p-2 bg-white border border-slate-200 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors shadow-sm"><Trash2 size={14}/></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <RoadmapManager />
          
          <InstrumentBankManager />

          <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm">
             <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2"><FileText size={20} className="text-emerald-600"/> Dokumen Standar Mutu</h3>
                <button onClick={() => setIsDocModalOpen(true)} className="px-5 py-2.5 bg-emerald-600 text-white rounded-full text-xs font-bold shadow-lg flex items-center gap-2 hover:bg-emerald-700 transition-colors"><Plus size={14}/> Tambah Dokumen</button>
             </div>
             <table className="w-full text-left text-xs">
                <thead><tr className="border-b"><th className="p-2">Nama Dokumen</th><th className="p-2">Kategori</th><th className="p-2">Tanggal Upload</th><th className="p-2">File</th></tr></thead>
                <tbody>
                  {documents.map(doc => (
                    <tr key={doc.id} className="border-b last:border-none hover:bg-slate-50">
                      <td className="p-3 font-bold">{doc.nama_dokumen}</td>
                      <td className="p-3"><span className="px-2 py-0.5 bg-slate-100 rounded text-slate-600 font-bold">{doc.kategori}</span></td>
                      <td className="p-3 text-slate-500">{new Date(doc.tanggal_upload).toLocaleDateString()}</td>
                      <td className="p-3">{doc.file ? <a href={`${API_BASE_URL}${doc.file}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Download</a> : 'Tidak ada'}</td>
                    </tr>
                  ))}
                </tbody>
             </table>
          </div>
        </div>

        <div className="space-y-6 lg:sticky lg:top-8">
          <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2"><Users size={20} className="text-rose-600"/> Tim Auditor</h3>
              <button onClick={() => setIsAssignModalOpen(true)} className="px-5 py-2.5 bg-rose-600 text-white rounded-full text-xs font-bold shadow-lg flex items-center gap-2 hover:bg-rose-700 transition-colors"><Plus size={14}/> Tugaskan</button>
            </div>
            <div className="space-y-4">
              {auditorsWithStats.length === 0 ? (
                 <div className="p-4 text-center text-slate-500 italic text-sm">Belum ada auditor terdaftar.</div>
              ) : (
                auditorsWithStats.map(auditor => (
                  <div key={auditor.id} className="flex items-center gap-4 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                     <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center font-bold">{auditor.nama.charAt(0)}</div>
                     <div>
                        <p className="font-bold text-slate-800 text-sm">{auditor.nama}</p>
                        <p className="text-[10px] text-slate-500">{auditor.activeAssignments} penugasan aktif</p>
                     </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm">
            <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2 mb-6"><Target size={20} className="text-blue-600"/> Penugasan Auditor</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead><tr className="border-b"><th className="p-2">Siklus</th><th className="p-2">Unit</th><th className="p-2">Auditor 1</th><th className="p-2">Auditor 2</th><th className="p-2">Tanggal</th><th className="p-2 text-center">Aksi</th></tr></thead>
                <tbody>
                  {assignments.map(assignment => (
                    <tr key={assignment.id} className="border-b last:border-none hover:bg-slate-50">
                      <td className="p-3 font-bold">{assignment.audit_cycle_name}</td>
                      <td className="p-3">{assignment.unit_name}</td>
                      <td className="p-3">{assignment.auditor1_name}</td>
                      <td className="p-3">{assignment.auditor2_name}</td>
                      <td className="p-3 text-slate-500">{new Date(assignment.assigned_date).toLocaleDateString()}</td>
                      <td className="p-3 flex justify-center gap-2">
                        <button onClick={() => handleEditAssignment(assignment)} className="p-1.5 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors" title="Edit"><Edit size={14}/></button>
                        <button onClick={() => handleDeleteAssignment(assignment.id)} className="p-1.5 bg-rose-100 text-rose-600 rounded-lg hover:bg-rose-200 transition-colors" title="Hapus"><Trash2 size={14}/></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      
      {isCycleModalOpen && <CreateCycleModal onClose={() => setIsCycleModalOpen(false)} onSave={handleCreateCycle} initialData={editingCycle} />}
      {isAssignModalOpen && <AssignAuditorModal onClose={() => { setIsAssignModalOpen(false); setEditingAssignment(null); }} onSave={handleAssignAuditor} allCycles={cycles} allUnits={allUnits} allAuditors={allAuditors} initialData={editingAssignment}/>}
      {isDocModalOpen && <AddStandardDocModal onClose={() => setIsDocModalOpen(false)} onSave={handleAddDocument} />}
    </div>
  );
};

export default UPMAdminView;
