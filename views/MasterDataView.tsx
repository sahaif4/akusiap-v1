
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, Plus, Edit, Trash2, Building2, Users, Save, X, Eye, EyeOff, UserPlus, ShieldCheck, 
  Building, GraduationCap, ChevronLeft, ChevronRight, Filter, BarChart3, ClipboardCheck, AlertCircle, Loader2 
} from 'lucide-react';
import { Role, User, Unit } from '../types';
import * as apiService from '../services/apiService';

const ITEMS_PER_PAGE = 10;

const USER_GROUPS = [
  { id: 'ALL', label: 'Semua Data', roles: [] },
  { id: 'MANAGEMENT', label: 'Level Manajemen', roles: [Role.PIMPINAN, Role.WADIR] },
  { id: 'UPM', label: 'Admin UPM', roles: [Role.ADMIN_UPM, Role.SUPER_ADMIN] },
  { id: 'AUDITOR', label: 'Tim Auditor', roles: [Role.AUDITOR] },
  { id: 'PRODI', label: 'Prodi & Auditee', roles: [Role.ADMIN_PRODI, Role.AUDITEE, Role.KAPRODI] },
];

const MasterDataView: React.FC<{currentUserRole: Role}> = ({ currentUserRole }) => {
  const isSuperAdmin = currentUserRole === Role.SUPER_ADMIN;
  const isAdminUPM = currentUserRole === Role.ADMIN_UPM;
  
  const [activeTab, setActiveTab] = useState<'unit' | 'user'>(isSuperAdmin ? 'user' : 'unit');
  const [userCategory, setUserCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [currentPage, setCurrentPage] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formRole, setFormRole] = useState<Role>(Role.ADMIN_PRODI);
  const [formAssignedUnits, setFormAssignedUnits] = useState<string[]>([]);

  const [users, setUsers] = useState<User[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
        const [usersData, unitsData] = await Promise.all([
            apiService.getUsers(),
            apiService.getUnits()
        ]);
        setUsers(usersData);
        setUnits(unitsData);
    } catch (e: any) {
        console.error("Failed to sync data from backend:", e);
        setError(e.message || "Gagal sinkronisasi dengan backend. Pastikan server berjalan.");
    } finally {
        setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);


  useEffect(() => { setCurrentPage(1); }, [searchQuery, userCategory, activeTab]);

  const openFormModal = (item: User | Unit | null) => {
    setEditingItem(item);
    if (activeTab === 'user' && item) {
      setFormRole((item as User).role);
      setFormAssignedUnits((item as User).assignedUnits || []);
    } else {
      setFormRole(Role.ADMIN_PRODI);
      setFormAssignedUnits([]);
    }
    setIsFormOpen(true);
  };

  const handleSaveUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!window.confirm("Apakah anda yakin?")) {
        alert("Anda kembali ke halaman semula");
        return;
    }

    const formData = new FormData(e.currentTarget);
    const userData: Partial<User> = {
      nama: formData.get('nama') as string,
      nip: formData.get('nip') as string,
      password: formData.get('password') as string,
      role: formData.get('role') as Role,
      unit_id: formData.get('unit_id') ? parseInt(formData.get('unit_id') as string) : undefined,
      status: 'aktif'
    };
    if (userData.role === Role.AUDITOR) {
      userData.assignedUnits = formAssignedUnits;
    }
    
    const payload = editingItem ? { ...editingItem, ...userData } : userData;
    
    try {
        await apiService.saveUser(payload);
        alert("Data anda tersimpan");
        await fetchData();
        setIsFormOpen(false);
        setEditingItem(null);
    } catch (e: any) {
        alert(`Gagal menyimpan pengguna: ${e.message}`);
    }
  };
  
  const handleDeleteUser = async (userId: number) => {
    if (window.confirm("Apakah anda yakin?")) {
        try {
            await apiService.deleteUser(userId);
            alert("Data anda tersimpan"); // "tersimpan" disini maksudnya perubahan (penghapusan) tersimpan
            await fetchData();
        } catch (e: any) {
            alert(`Gagal menghapus pengguna: ${e.message}`);
        }
    } else {
        alert("Anda kembali ke halaman semula");
    }
  };


  const handleSaveUnit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!window.confirm("Apakah anda yakin?")) {
        alert("Anda kembali ke halaman semula");
        return;
    }

    const formData = new FormData(e.currentTarget);
    const unitData: Partial<Unit> = {
      kode_unit: formData.get('kode_unit') as string,
      nama_unit: formData.get('nama_unit') as string,
      jenis_unit: formData.get('jenis_unit') as 'prodi' | 'pendukung' | 'manajemen',
    };

    const payload = editingItem ? { ...editingItem, ...unitData } : unitData;

    try {
        await apiService.saveUnit(payload);
        alert("Data anda tersimpan");
        await fetchData();
        setIsFormOpen(false);
        setEditingItem(null);
    } catch (e: any) {
        alert(`Gagal menyimpan unit: ${e.message}`);
    }
  };

  const handleDeleteUnit = async (unitId: number) => {
    if (window.confirm("Apakah anda yakin?")) {
        try {
            await apiService.deleteUnit(unitId);
            alert("Data anda tersimpan");
            await fetchData();
        } catch (e: any) {
            alert(`Gagal menghapus unit: ${e.message}`);
        }
    } else {
        alert("Anda kembali ke halaman semula");
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = user.nama.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            user.nip.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;
      if (userCategory === 'ALL') return true;
      const group = USER_GROUPS.find(g => g.id === userCategory);
      return group ? group.roles.includes(user.role) : true;
    });
  }, [users, searchQuery, userCategory]);

  const filteredUnits = useMemo(() => units.filter(unit => unit.nama_unit.toLowerCase().includes(searchQuery.toLowerCase())), [units, searchQuery]);

  const currentData = activeTab === 'user' ? filteredUsers : filteredUnits;
  const totalPages = Math.ceil(currentData.length / ITEMS_PER_PAGE);
  const paginatedData = currentData.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const getUnitName = (id?: number) => units.find(u => u.id === id)?.nama_unit || '-';

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Database Master PEPI</h2>
          <p className="text-sm text-slate-500 font-medium">Manajemen Struktur Organisasi & Akses Pengguna</p>
        </div>
        <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm w-fit">
          {isSuperAdmin && <button onClick={() => setActiveTab('user')} className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'user' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}><Users size={14}/> Daftar Pengguna</button>}
          {(isSuperAdmin || isAdminUPM) && <button onClick={() => setActiveTab('unit')} className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'unit' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}><Building2 size={14}/> Organisasi</button>}
        </div>
      </div>
      <div className="bg-white border border-slate-200 rounded-[2rem] overflow-hidden shadow-sm min-h-[500px] flex flex-col">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-50/50">
           <div className="relative w-full md:w-96">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" placeholder={activeTab === 'user' ? "Cari nama / NIP..." : "Cari nama unit..."} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500" />
           </div>
           {((activeTab === 'user' && isSuperAdmin) || (activeTab === 'unit' && (isSuperAdmin || isAdminUPM))) && (
             <button onClick={() => openFormModal(null)} className="px-6 py-3 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg flex items-center gap-2 transition-all active:scale-95 hover:bg-indigo-700">
                <Plus size={16} /> Tambah {activeTab === 'user' ? 'User' : 'Unit'}
             </button>
           )}
        </div>
        {activeTab === 'user' ? (
          <>
            <div className="px-6 py-3 bg-white border-b border-slate-100 flex gap-2 overflow-x-auto custom-scrollbar">
              {USER_GROUPS.map(group => (<button key={group.id} onClick={() => setUserCategory(group.id)} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border ${userCategory === group.id ? 'bg-slate-900 text-white border-slate-900 shadow-md' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}>{group.label}</button>))}
            </div>
            {error && (
              <div className="m-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs font-bold text-amber-700 flex items-center gap-2">
                <AlertCircle size={16}/> {error}
              </div>
            )}
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left">
                <thead><tr className="bg-slate-50/50 border-b border-slate-100"><th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Data Pengguna</th><th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Peran & Unit</th><th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Aksi</th></tr></thead>
                <tbody className="divide-y divide-slate-100">
                  {isLoading ? (<tr><td colSpan={3} className="text-center py-10"><Loader2 className="animate-spin text-indigo-500" /></td></tr>) : paginatedData.length === 0 ? (<tr><td colSpan={3} className="px-8 py-10 text-center text-slate-400 italic text-xs">Data tidak ditemukan.</td></tr>) : paginatedData.map((user: any) => (
                    <tr key={user.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-8 py-4"><div className="flex items-center gap-4"><div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shadow-sm ${user.role === Role.AUDITOR ? 'bg-indigo-100 text-indigo-600' : user.role === Role.PIMPINAN || user.role === Role.WADIR ? 'bg-amber-100 text-amber-600' : user.role === Role.ADMIN_UPM ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-600'}`}>{user.nama.charAt(0)}</div><div><p className="text-sm font-bold text-slate-900">{user.nama}</p><p className="text-[11px] text-slate-500 font-mono">NIP: {user.nip}</p></div></div></td>
                      <td className="px-8 py-4">
                        <span className={`px-2 py-1 text-[9px] font-black rounded-md uppercase tracking-wider mb-1 inline-block ${user.role === Role.AUDITOR ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' : user.role === Role.PIMPINAN || user.role === Role.WADIR ? 'bg-amber-50 text-amber-700 border border-amber-100' : 'bg-slate-50 text-slate-600 border border-slate-200'}`}>{user.role}</span>
                        {user.role === Role.AUDITOR && user.assignedUnits?.length > 0 ? (
                            <div className="flex flex-wrap gap-1 mt-1">{user.assignedUnits.map((u: string) => <span key={u} className="px-1.5 py-0.5 text-[9px] font-bold bg-slate-200 text-slate-600 rounded">{u}</span>)}</div>
                        ) : (
                            <p className="text-[11px] text-slate-500 font-medium truncate max-w-xs">{getUnitName(user.unit_id)}</p>
                        )}
                      </td>
                      <td className="px-8 py-4 text-right"><div className="flex justify-end gap-2"><button onClick={() => openFormModal(user)} className="p-2 bg-slate-100 text-slate-400 hover:bg-indigo-600 hover:text-white rounded-lg transition-all"><Edit size={14} /></button><button onClick={() => handleDeleteUser(user.id)} className="p-2 bg-slate-100 text-slate-400 hover:bg-rose-600 hover:text-white rounded-lg transition-all"><Trash2 size={14} /></button></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="flex-1 p-8 bg-slate-50 relative">
            {error && (
              <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs font-bold text-amber-700 flex items-center gap-2">
                <AlertCircle size={16}/> {error}
              </div>
            )}
            {isLoading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-white/50">
                <Loader2 size={32} className="animate-spin text-indigo-600"/>
              </div>
            ) : paginatedData.length === 0 ? (
              <div className="flex items-center justify-center h-full text-slate-400 italic text-sm">Tidak ada data unit. Cek koneksi backend.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {paginatedData.map((unit: any) => {
                  const mockData = [{ status: 'Selesai', color: 'emerald'}, { status: 'Temuan Terbuka', color: 'amber'}, { status: 'Proses Audit', color: 'blue'}];
                  const unitMock = mockData[unit.id % 3];
                  return (
                    <div key={unit.id} className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden relative group shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                      <div className="p-8 pb-24"><div className="flex justify-between items-start mb-6"><div className={`p-4 bg-gradient-to-br ${unit.jenis_unit === 'prodi' ? 'from-emerald-50 to-green-50 text-emerald-600' : 'from-blue-50 to-sky-50 text-blue-600'} rounded-2xl`}>{unit.jenis_unit === 'prodi' ? <GraduationCap size={24} /> : <Building size={24} />}</div><div className={`flex items-center gap-2 px-3 py-1 bg-${unitMock.color}-50 text-${unitMock.color}-700 rounded-full text-[10px] font-bold border border-${unitMock.color}-100`}><div className={`w-2 h-2 rounded-full bg-${unitMock.color}-500`}></div>{unitMock.status}</div></div><p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{unit.jenis_unit === 'prodi' ? 'Unit Akademik' : 'Unit Pendukung'}</p><h3 className="text-lg font-black text-slate-900 leading-tight mb-2 min-h-[50px]">{unit.nama_unit}</h3><p className="text-xs text-slate-500 font-medium mb-4 min-h-[40px]">{unit.jenis_unit === 'prodi' ? 'Fokus pada pelaksanaan Tridharma Perguruan Tinggi.' : 'Mendukung operasional dan layanan institusi.'}</p><span className="text-[10px] font-mono bg-slate-100 text-slate-500 px-2 py-1 rounded">KODE: {unit.kode_unit}</span></div>
                      <div className="absolute bottom-0 left-0 right-0 bg-slate-800/95 backdrop-blur-sm p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out"><div className="flex justify-around items-center"><button className="flex flex-col items-center text-slate-300 hover:text-white transition-colors p-1"><BarChart3 size={16}/><span className="text-[9px] mt-1 font-bold">Dashboard</span></button><button className="flex flex-col items-center text-slate-300 hover:text-white transition-colors p-1"><ClipboardCheck size={16}/><span className="text-[9px] mt-1 font-bold">Audit</span></button><button className="flex flex-col items-center text-slate-300 hover:text-white transition-colors p-1"><AlertCircle size={16}/><span className="text-[9px] mt-1 font-bold">Temuan</span></button><button className="flex flex-col items-center text-slate-300 hover:text-white transition-colors p-1"><Users size={16}/><span className="text-[9px] mt-1 font-bold">RTM</span></button><div className="w-px h-8 bg-slate-700"></div><button onClick={() => openFormModal(unit)} className="flex flex-col items-center text-amber-400 hover:text-amber-300 transition-colors p-1"><Edit size={16}/><span className="text-[9px] mt-1 font-bold">Edit</span></button><button onClick={() => handleDeleteUnit(unit.id)} className="flex flex-col items-center text-rose-400 hover:text-rose-300 transition-colors p-1"><Trash2 size={16}/><span className="text-[9px] mt-1 font-bold">Hapus</span></button></div></div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
        <div className="p-6 border-t border-slate-100 flex items-center justify-between bg-slate-50"><div className="text-xs font-bold text-slate-500">Menampilkan {((currentPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, currentData.length)} dari {currentData.length} data</div><div className="flex items-center gap-2"><button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 bg-white border border-slate-200 rounded-lg text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"><ChevronLeft size={16} /></button><div className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-black text-slate-700">Halaman {currentPage} / {totalPages || 1}</div><button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0} className="p-2 bg-white border border-slate-200 rounded-lg text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"><ChevronRight size={16} /></button></div></div>
      </div>
      {isFormOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setIsFormOpen(false)} />
          <div className="relative bg-white w-full max-w-lg rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-8"><h3 className="text-2xl font-black text-slate-900">{editingItem ? 'Edit Data' : 'Tambah Data'}</h3><button onClick={() => setIsFormOpen(false)} className="p-2 bg-slate-100 rounded-full text-slate-400 hover:bg-slate-200"><X size={20}/></button></div>
            <form onSubmit={activeTab === 'user' ? handleSaveUser : handleSaveUnit} className="space-y-5">
              {activeTab === 'user' ? (
                <>
                  <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1">Nama Lengkap</label><input name="nama" defaultValue={editingItem?.nama} required className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500" /></div>
                  <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1">NIP / ID Login</label><input name="nip" defaultValue={editingItem?.nip} required className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-2xl text-sm font-mono font-bold outline-none focus:ring-2 focus:ring-indigo-500" /></div>
                  <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1">Password</label><div className="relative"><input name="password" type={showPassword ? 'text' : 'password'} defaultValue={editingItem?.password || 'pepi123'} required className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500" /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">{showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}</button></div></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1">Role</label><select name="role" value={formRole} onChange={(e) => setFormRole(e.target.value as Role)} className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-2xl text-xs font-bold outline-none">{Object.values(Role).map(r => <option key={r} value={r}>{r}</option>)}</select></div>
                    <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1">Unit Kerja Utama</label><select name="unit_id" defaultValue={editingItem?.unit_id || 1} className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-2xl text-xs font-bold outline-none">{units.map(u => <option key={u.id} value={u.id}>{u.kode_unit}</option>)}</select></div>
                  </div>
                  
                  {formRole === Role.AUDITOR && (
                    <div className="space-y-3 pt-4 border-t border-slate-200">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1">Unit yang Diaudit</label>
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 grid grid-cols-2 gap-3">
                        {units.map(unit => (
                          <label key={unit.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-100 cursor-pointer">
                            <input
                              type="checkbox"
                              className="w-4 h-4 text-indigo-600 rounded"
                              checked={formAssignedUnits.includes(unit.kode_unit)}
                              onChange={() => {
                                setFormAssignedUnits(prev =>
                                  prev.includes(unit.kode_unit)
                                    ? prev.filter(code => code !== unit.kode_unit)
                                    : [...prev, unit.kode_unit]
                                );
                              }}
                            />
                            <span className="text-xs font-bold">{unit.kode_unit}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1">Kode Unit</label><input name="kode_unit" defaultValue={editingItem?.kode_unit} required className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-2xl text-sm font-bold uppercase outline-none focus:ring-2 focus:ring-indigo-500" /></div>
                  <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1">Nama Unit Lengkap</label><input name="nama_unit" defaultValue={editingItem?.nama_unit} required className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500" /></div>
                  <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1">Jenis Unit</label><select name="jenis_unit" defaultValue={editingItem?.jenis_unit} className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-2xl text-sm font-bold outline-none"><option value="prodi">Program Studi (Prodi)</option><option value="pendukung">Unit Pendukung / Bagian</option><option value="Manajemen">Level Manajemen</option></select></div>
                </>
              )}
              <button type="submit" className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 mt-4 hover:bg-indigo-700 transition-all active:scale-95"><Save size={18} /> Simpan Data</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default MasterDataView;
