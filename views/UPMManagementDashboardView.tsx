import React, { useState, useEffect } from 'react';
import { Briefcase, User, CheckCircle2, Users, Calendar, Flag, Target, Check, Clock, Edit, Trash2, Plus, X, Save } from 'lucide-react';
import { CurrentUser, Role, UPMAgenda } from '../types';
import * as apiService from '../services/apiService';
import CalendarModal from '../components/CalendarModal';

const MONTHLY_CYCLE = [
    { month: 'Jan', task: 'Penetapan Standar' },
    { month: 'Feb', task: 'Sosialisasi Standar' },
    { month: 'Mar', task: 'Pelaksanaan Standar' },
    { month: 'Apr', task: 'Monitoring Pelaksanaan' },
    { month: 'May', task: 'Evaluasi Diri' },
    { month: 'Jun', task: 'Audit Mutu Internal' },
    { month: 'Jul', task: 'Rapat Tinjauan Manajemen' },
    { month: 'Aug', task: 'Peningkatan Standar' },
    { month: 'Sep', task: 'Penetapan Standar Baru' },
    { month: 'Oct', task: 'Benchmarking' },
    { month: 'Nov', task: 'Evaluasi Kepuasan' },
    { month: 'Dec', task: 'Laporan Tahunan' }
];

const ACCREDITATION_ROADMAP = [
    {
        id: 1, timeframe: 'JAN 2026', milestone: 'Pembentukan Tim Akreditasi', 
        team: 'UPM', status: 'Selesai', targetDate: '2026-01-15', reminderDaysBefore: 7
    },
    {
        id: 2, timeframe: 'FEB 2026', milestone: 'Penyusunan LKPS & LED', 
        team: 'Tim Akreditasi', status: 'Berjalan', targetDate: '2026-02-28', reminderDaysBefore: 14
    }
];

const UPMManagementDashboardView: React.FC<Props> = ({ currentUser }) => {
    const isUPMAdmin = currentUser?.role === Role.ADMIN_UPM || currentUser?.role === Role.SUPER_ADMIN;
    const currentMonthIndex = new Date().getMonth();
    const [accreditationRoadmap, setAccreditationRoadmap] = useState<any[]>([]);
    const [strategicAgendas, setStrategicAgendas] = useState<UPMAgenda[]>([]);
    const [annualCycle, setAnnualCycle] = useState<any[]>(MONTHLY_CYCLE);
    const [calendarEvents, setCalendarEvents] = useState<UPMAgenda[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [selectedMonthIndex, setSelectedMonthIndex] = useState(0);
    const [editingItem, setEditingItem] = useState<Partial<UPMAgenda> | null>(null);

    const fetchRoadmap = async () => {
        try {
            const agendas = await apiService.getUPMAgendas();
            
            // Strategic Agendas Logic
            setStrategicAgendas(agendas.filter(agenda => agenda.agenda_type === 'strategic'));

            // Roadmap Logic
            const roadmapItems = agendas
                .filter(agenda => agenda.agenda_type === 'roadmap')
                .sort((a,b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
                .map(agenda => ({
                    id: agenda.id,
                    timeframe: agenda.target_date ? new Date(agenda.target_date).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' }) : 'TBD',
                    milestone: agenda.title,
                    team: agenda.responsible_unit || 'Tim Manajemen Mutu',
                    status: agenda.status === 'done' ? 'Selesai' : 
                            agenda.status === 'ongoing' ? 'Berjalan' : 'Belum Dimulai',
                    targetDate: agenda.target_date,
                    reminderDaysBefore: agenda.reminder_days_before,
                    original: agenda
                }));
            setAccreditationRoadmap(roadmapItems);

            // Annual Cycle Logic (Themes)
            const cycleItems = agendas.filter(agenda => agenda.agenda_type === 'cycle');
            const mergedCycle = MONTHLY_CYCLE.map((defaultItem, idx) => {
                const found = cycleItems.find(a => new Date(a.start_date).getMonth() === idx);
                return found ? {
                    month: defaultItem.month,
                    task: found.title,
                    id: found.id,
                    original: found
                } : defaultItem;
            });
            setAnnualCycle(mergedCycle);

            // Calendar Events Logic
            setCalendarEvents(agendas.filter(agenda => agenda.agenda_type === 'cycle_event'));

        } catch (error) {
            console.error('Gagal mengambil roadmap:', error);
            // Fallback ke data hardcoded jika API gagal
            setAccreditationRoadmap(ACCREDITATION_ROADMAP);
            setAnnualCycle(MONTHLY_CYCLE);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRoadmap();
    }, []);

    const handleDelete = async (id: number) => {
        if(!confirm("Hapus item ini?")) return;
        try {
            await apiService.deleteUPMAgenda(id);
            fetchRoadmap();
        } catch(e) { alert("Gagal menghapus"); }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!editingItem) return;
        
        try {
            const payload = {
                ...editingItem,
                agenda_type: editingItem.agenda_type || 'roadmap'
            };
            await apiService.saveUPMAgenda(payload as any);
            setIsModalOpen(false);
            setEditingItem(null);
            fetchRoadmap();
        } catch(e) { alert("Gagal menyimpan"); }
    };

    const openEdit = (item: any) => {
        setEditingItem(item.original);
        setIsModalOpen(true);
    };

    const openCreate = () => {
        setEditingItem({
            title: '',
            description: '',
            start_date: new Date().toISOString().split('T')[0],
            target_date: new Date().toISOString().split('T')[0],
            status: 'planned',
            responsible_unit: '',
            agenda_type: 'roadmap'
        });
        setIsModalOpen(true);
    };

    const openCreateStrategic = () => {
        setEditingItem({
            title: '',
            description: '',
            start_date: new Date().toISOString().split('T')[0],
            target_date: new Date().toISOString().split('T')[0],
            status: 'planned',
            responsible_unit: '',
            agenda_type: 'strategic',
            is_active: true
        });
        setIsModalOpen(true);
    };

    const openEditCycle = (monthIdx: number, existingItem?: any) => {
        setSelectedMonthIndex(monthIdx);
        setIsCalendarOpen(true);
    };

    const handleCalendarAddEvent = async (dateStr: string) => {
        const title = prompt("Masukkan nama agenda:");
        if (!title) return;
        
        try {
            const payload = {
                title,
                description: '',
                start_date: dateStr,
                target_date: dateStr,
                status: 'planned' as const,
                responsible_unit: 'UPM',
                agenda_type: 'cycle_event' as const
            };
            await apiService.saveUPMAgenda(payload);
            fetchRoadmap();
        } catch(e) { alert("Gagal menyimpan agenda"); }
    };

    const handleCalendarEditEvent = async (event: UPMAgenda) => {
         const newTitle = prompt("Edit nama agenda:", event.title);
         if (newTitle === null) return; // Cancelled
         if (!newTitle) return; // Empty

         try {
             await apiService.saveUPMAgenda({ ...event, title: newTitle });
             fetchRoadmap();
         } catch(e) { alert("Gagal mengupdate agenda"); }
    };

    const handleCalendarDeleteEvent = async (id: number) => {
        if(!confirm("Hapus agenda ini?")) return;
        try {
            await apiService.deleteUPMAgenda(id);
            fetchRoadmap();
        } catch(e) { alert("Gagal menghapus agenda"); }
    };

    const handleEditTheme = async (newTheme: string) => {
        const year = new Date().getFullYear();
        const dateStr = new Date(year, selectedMonthIndex, 2).toISOString().split('T')[0];
        const existingItem = annualCycle[selectedMonthIndex];

        if (!newTheme.trim()) {
            // If empty, delete if exists
            if (existingItem.id) {
                await handleDelete(existingItem.id);
            }
            return;
        }

        try {
            const payload = {
                id: existingItem.id, // If undefined, API creates new
                title: newTheme,
                description: '',
                start_date: dateStr,
                target_date: dateStr,
                status: 'ongoing' as const,
                responsible_unit: 'UPM',
                agenda_type: 'cycle' as const
            };
            await apiService.saveUPMAgenda(payload);
            fetchRoadmap();
        } catch(e) { alert("Gagal menyimpan tema bulan"); }
    };

    const handleToggleActive = async (item: UPMAgenda) => {
        try {
            await apiService.saveUPMAgenda({ ...item, is_active: !item.is_active });
            fetchRoadmap();
        } catch(e) { alert("Gagal mengubah status aktif"); }
    };
    
    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] -mr-20 -mt-20"></div>
                <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-2">
                        <Briefcase size={28}/>
                        <h2 className="text-3xl font-black tracking-tight">Dasbor Manajemen UPM</h2>
                    </div>
                    <p className="text-slate-400 max-w-2xl">Pusat informasi, panduan operasional, dan panel kontrol strategis untuk Unit Penjaminan Mutu PEPI.</p>
                </div>
            </div>

            <div className="space-y-12">
                {/* Monthly Cycle */}
                <section>
                     <div className="text-center mb-10">
                        <h3 className="text-2xl font-black text-slate-900">Siklus Penjaminan Mutu Tahunan</h3>
                        <p className="text-sm text-slate-500">Panduan aktivitas bulanan berbasis siklus PPEPP.</p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {annualCycle.map((item, idx) => (
                            <div key={idx} 
                                onClick={() => openEditCycle(idx, item)}
                                className={`p-4 rounded-2xl border-2 transition-all relative group cursor-pointer hover:border-indigo-400 ${idx === currentMonthIndex ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-white border-slate-200 text-slate-700'}`}>
                                <p className={`text-xs font-black ${idx === currentMonthIndex ? 'text-indigo-200' : 'text-slate-400'}`}>{item.month.toUpperCase()}</p>
                                <p className={`text-xs font-bold mt-1 ${idx === currentMonthIndex ? '' : 'text-slate-800'}`}>{item.task}</p>
                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Calendar size={12} className={idx === currentMonthIndex ? 'text-indigo-200' : 'text-slate-400'} />
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Strategic Agenda */}
                <section>
                    <div className="text-center mb-12">
                        <div className="flex items-center justify-center gap-3 mb-2">
                            <h3 className="text-2xl font-black text-slate-900">Agenda Strategis Utama</h3>
                            {isUPMAdmin && (
                                <button onClick={openCreateStrategic} className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center hover:bg-indigo-700 transition-colors shadow-lg" title="Tambah Agenda Strategis">
                                    <Plus size={16} />
                                </button>
                            )}
                        </div>
                        <p className="text-sm text-slate-500">Agenda prioritas yang ditampilkan di dashboard utama.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {strategicAgendas.map((item, idx) => (
                            <div key={idx} className={`bg-white p-6 rounded-2xl border ${item.is_active ? 'border-indigo-500 shadow-lg shadow-indigo-100' : 'border-slate-200'} relative group`}>
                                {item.is_active && <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl rounded-tr-xl">AKTIF</div>}
                                <div className="mb-4">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{item.target_date ? new Date(item.target_date).toLocaleDateString('id-ID') : 'TBD'}</p>
                                    <h4 className="font-bold text-slate-900 text-lg leading-snug">{item.title}</h4>
                                    <p className="text-xs text-slate-500 mt-2 line-clamp-2">{item.description || 'Tidak ada deskripsi.'}</p>
                                </div>
                                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                                    <div className="flex items-center gap-2">
                                        <span className={`w-2 h-2 rounded-full ${item.status === 'done' ? 'bg-emerald-500' : item.status === 'ongoing' ? 'bg-indigo-500' : 'bg-slate-400'}`}></span>
                                        <span className="text-xs font-bold text-slate-600 capitalize">{item.status === 'done' ? 'Selesai' : item.status === 'ongoing' ? 'Berjalan' : 'Belum Dimulai'}</span>
                                    </div>
                                    {isUPMAdmin && (
                                        <div className="flex gap-2">
                                            <button onClick={() => handleToggleActive(item)} className={`p-1.5 rounded-lg transition-colors ${item.is_active ? 'text-indigo-600 bg-indigo-50' : 'text-slate-400 hover:text-indigo-600 hover:bg-slate-50'}`} title={item.is_active ? "Nonaktifkan" : "Aktifkan"}>
                                                <Target size={14} />
                                            </button>
                                            <button onClick={() => { setEditingItem(item); setIsModalOpen(true); }} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"><Edit size={14}/></button>
                                            <button onClick={() => handleDelete(item.id!)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"><Trash2 size={14}/></button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        {strategicAgendas.length === 0 && (
                            <div className="col-span-full text-center py-8 text-slate-400 italic text-sm border-2 border-dashed border-slate-200 rounded-2xl">
                                Belum ada agenda strategis.
                            </div>
                        )}
                    </div>
                </section>

                {/* Accreditation Roadmap */}
                <section>
                    <div className="text-center mb-12">
                        <div className="flex items-center justify-center gap-3 mb-2">
                            <h3 className="text-2xl font-black text-slate-900">Peta Jalan Persiapan Akreditasi – 2026</h3>
                            {isUPMAdmin && (
                                <button onClick={openCreate} className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center hover:bg-indigo-700 transition-colors shadow-lg" title="Tambah Agenda">
                                    <Plus size={16} />
                                </button>
                            )}
                        </div>
                        <p className="text-sm text-slate-500">Panel kontrol strategis untuk memastikan kesiapan institusi.</p>
                        {loading && (
                            <div className="mt-4 text-sm text-slate-400 flex items-center justify-center gap-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
                                Memuat roadmap dari database...
                            </div>
                        )}
                    </div>
                    <div className="relative flex flex-col gap-8 ml-6">
                        <div className="absolute left-6 top-0 bottom-0 w-1 bg-slate-200" />
                        {(accreditationRoadmap.length > 0 ? accreditationRoadmap : ACCREDITATION_ROADMAP).map((item, idx) => {
                             const statusStyle = {
                                Selesai: { icon: Check, color: 'emerald' },
                                Berjalan: { icon: Clock, color: 'indigo' },
                                'Belum Dimulai': { icon: Target, color: 'slate' }
                             }[item.status] || { icon: Target, color: 'slate' };
                             const Icon = statusStyle.icon;
                            return (
                            <div key={idx} className="relative z-10 flex items-start gap-8">
                                <div className={`w-12 h-12 rounded-full flex-shrink-0 bg-${statusStyle.color}-600 text-white flex items-center justify-center border-4 border-slate-50 shadow-md`}>
                                    <Flag size={20} />
                                </div>
                                <div className="bg-white p-6 rounded-2xl border border-slate-200 flex-1 shadow-sm group">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{item.timeframe}</p>
                                            <h4 className="font-bold text-slate-800">{item.milestone}</h4>
                                            <p className="text-xs text-slate-500 mt-1">Penanggung Jawab: <span className="font-semibold">{item.team}</span></p>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <div className={`flex items-center gap-2 px-3 py-1 bg-${statusStyle.color}-50 text-${statusStyle.color}-700 rounded-full text-[10px] font-bold border border-${statusStyle.color}-100`}>
                                                <Icon size={12}/>{item.status}
                                            </div>
                                            {item.targetDate && (() => {
                                                const diff = +new Date(item.targetDate) - +new Date();
                                                const daysLeft = diff > 0 ? Math.floor(diff / (1000 * 60 * 60 * 24)) : 0;
                                                const threshold = typeof item.reminderDaysBefore === 'number' ? item.reminderDaysBefore : 180;
                                                const urgent = diff > 0 && daysLeft <= threshold;
                                                return (
                                                    <div className={`flex items-center gap-2 px-3 py-1 ${urgent ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-slate-50 text-slate-700 border-slate-200'} rounded-full text-[10px] font-bold border`}>
                                                        <Clock size={12}/>{diff > 0 ? `${daysLeft} hari lagi` : 'Lewat jatuh tempo'}
                                                    </div>
                                                );
                                            })()}
                                            {isUPMAdmin && item.id && (
                                                <div className="flex gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => openEdit(item)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"><Edit size={12}/></button>
                                                    <button onClick={() => handleDelete(item.id)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"><Trash2 size={12}/></button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )})}
                    </div>
                </section>

            </div>

            {isModalOpen && editingItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg text-slate-800">
                            {editingItem.agenda_type === 'cycle' ? 'Edit Siklus Bulanan' : 
                             editingItem.agenda_type === 'strategic' ? (editingItem.id ? 'Edit Agenda Strategis' : 'Buat Agenda Strategis') :
                             editingItem.id ? 'Edit Agenda Roadmap' : 'Buat Agenda Roadmap'}
                        </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
                        </div>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">
                                    {editingItem.agenda_type === 'cycle' ? 'Aktivitas Utama' : 'Judul Kegiatan'}
                                </label>
                                <textarea required className="w-full p-3 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none resize-none h-24" value={editingItem.title} onChange={e => setEditingItem({...editingItem, title: e.target.value})} placeholder={editingItem.agenda_type === 'cycle' ? "Deskripsi aktivitas..." : "Contoh: Penyusunan LED..."} />
                            </div>
                            
                            {editingItem.agenda_type !== 'cycle' && (
                                <>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Target Waktu</label>
                                            <input type="date" required className="w-full p-3 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none" value={editingItem.target_date ? editingItem.target_date.split('T')[0] : ''} onChange={e => setEditingItem({...editingItem, target_date: e.target.value})}/>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Status</label>
                                            <select className="w-full p-3 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none" value={editingItem.status} onChange={e => setEditingItem({...editingItem, status: e.target.value as any})}>
                                                <option value="planned">Belum Dimulai</option>
                                                <option value="ongoing">Sedang Berjalan</option>
                                                <option value="done">Selesai</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Penanggung Jawab (PIC)</label>
                                        <input className="w-full p-3 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none" value={editingItem.responsible_unit} onChange={e => setEditingItem({...editingItem, responsible_unit: e.target.value})} placeholder="Contoh: Tim Manajemen Mutu" />
                                    </div>
                                </>
                            )}

                            <div className="flex justify-between pt-4">
                                {editingItem.id && editingItem.agenda_type === 'cycle' ? (
                                    <button type="button" onClick={() => handleDelete(editingItem.id!)} className="px-4 py-2 text-rose-600 font-bold text-xs hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-2"><Trash2 size={14}/> Reset ke Default</button>
                                ) : <div></div>}
                                <div className="flex gap-2">
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 font-bold text-xs hover:bg-slate-100 rounded-lg transition-colors">Batal</button>
                                    <button type="submit" className="px-4 py-2 bg-indigo-600 text-white font-bold text-xs rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"><Save size={14}/> Simpan</button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <CalendarModal 
                isOpen={isCalendarOpen}
                onClose={() => setIsCalendarOpen(false)}
                initialDate={new Date(new Date().getFullYear(), selectedMonthIndex, 1)}
                events={calendarEvents}
                onAddEvent={handleCalendarAddEvent}
                onEditEvent={handleCalendarEditEvent}
                onDeleteEvent={handleCalendarDeleteEvent}
                isAdmin={isUPMAdmin}
                monthTheme={annualCycle[selectedMonthIndex]?.task}
                onEditTheme={handleEditTheme}
            />
        </div>
    );
};

export default UPMManagementDashboardView;
