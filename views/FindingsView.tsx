
import React, { useState, useMemo, useEffect } from 'react';
import { Sparkles, AlertTriangle, Search, Clock, Cpu, Plus, Filter, X, Building2, BookOpen, ClipboardCheck, Paperclip, Lock, ChevronDown, Calendar, Upload, UserCheck, Check, Save, Edit, History, PlusCircle, CheckCircle, Loader2, Download, FileSpreadsheet, Eye, FileText } from 'lucide-react';
import * as apiService from '../services/apiService';
import { Finding, FindingType, RiskLevel, Unit, Role, CurrentUser } from '../types';
import AddFindingModal from '../components/AddFindingModal';

const formatRelativeTime = (isoString: string): string => {
  if (!isoString) return 'beberapa saat lalu';
  const date = new Date(isoString);
  const now = new Date();
  const seconds = Math.round((now.getTime() - date.getTime()) / 1000);
  
  if (seconds < 5) return "baru saja";
  if (seconds < 60) return `${seconds} detik yang lalu`;
  
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} menit yang lalu`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} jam yang lalu`;

  const days = Math.round(hours / 24);
  if (days < 7) return `${days} hari yang lalu`;
  if (days < 30) return `${Math.round(days / 7)} minggu yang lalu`;
  
  const months = Math.round(days / 30);
  if (months < 12) return `${months} bulan yang lalu`;

  const years = Math.round(days / 365);
  return `${years} tahun yang lalu`;
};

const FindingsView: React.FC<{currentUser: CurrentUser | null}> = ({ currentUser }) => {
  const [selectedFinding, setSelectedFinding] = useState<Finding | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFinding, setEditingFinding] = useState<Finding | null>(null);
  const [detailTab, setDetailTab] = useState<'detail' | 'rtl' | 'verifikasi' | 'history'>('detail');
  
  const [findings, setFindings] = useState<Finding[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filterUnit, setFilterUnit] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState<{ name: string; type: 'image' | 'other' } | null>(null);

  const userRole = currentUser?.role || Role.SUPER_ADMIN;
  const userName = currentUser?.name || 'Sistem';
  const canEditRTL = [Role.ADMIN_PRODI, Role.AUDITEE, Role.SUPER_ADMIN].includes(userRole);
  const canVerify = [Role.AUDITOR, Role.SUPER_ADMIN, Role.ADMIN_UPM].includes(userRole);

  const fetchInitialData = async () => {
    setIsLoading(true);
    setError(null);
    try {
        const [findingsData, unitsData] = await Promise.all([
            apiService.getFindings(),
            apiService.getUnits()
        ]);
        setFindings(findingsData);
        setUnits(unitsData);
    } catch (e: any) {
        setError(e.message || "Gagal memuat data dari server. Pastikan backend berjalan.");
    } finally {
        setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const filteredFindings = useMemo(() => {
    return findings.filter(f => 
        (filterUnit === '' || f.unit === filterUnit) && 
        (searchQuery === '' || f.uraian.toLowerCase().includes(searchQuery.toLowerCase())) &&
        (filterType === '' || f.tipe === filterType)
    ).sort((a, b) => b.id - a.id); // Sort by newest first
  }, [findings, filterUnit, searchQuery, filterType]);
  
  useEffect(() => {
    if (selectedFinding) {
      const updatedFinding = findings.find(f => f.id === selectedFinding.id);
      if (updatedFinding) setSelectedFinding(updatedFinding);
    }
  }, [findings, selectedFinding?.id]);

  const handleSelectFinding = (finding: Finding) => {
    setSelectedFinding(finding);
    setDetailTab('detail');
    setAiResult(null);
  };

  const handleExport = (format: 'pdf' | 'excel') => {
    const message = `Mengekspor ${filteredFindings.length} temuan yang difilter saat ini ke file ${format.toUpperCase()} untuk analisis...`;
    alert(message);
  };

  const handlePreview = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    const isImage = ['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(extension || '');
    setPreviewFile({ name: fileName, type: isImage ? 'image' : 'other' });
    setIsPreviewModalOpen(true);
  };

  const handleAnalyzeWithAI = async (finding: Finding) => {
    setIsAnalyzing(true); setAiResult(null);
    try {
        const result = await apiService.analyzeFindingAI(finding.uraian);
        // Backend returns { analysis: {akar_masalah: ..., tindakan_koreksi: ...} }
        setAiResult(result.analysis);
    } catch (e: any) {
        alert(`Gagal menghubungi layanan AI: ${e.message}`);
    } finally {
        setIsAnalyzing(false);
    }
  };

  const handleSaveFinding = async (findingData: Partial<Finding>) => {
    const isEditing = !!findingData.id;
    const newHistoryEntry = {
      id: Date.now(),
      user: userName,
      role: userRole,
      action: isEditing ? 'Detail temuan diperbarui.' : 'Temuan dibuat.',
      timestamp: new Date().toISOString()
    };

    const payload = {
        ...findingData,
        history: [newHistoryEntry, ...(findingData.history || [])]
    };

    try {
        await apiService.saveFinding(payload);
        fetchInitialData(); // Refetch all data to ensure consistency
        setIsModalOpen(false);
        setEditingFinding(null);
    } catch (e: any) {
        alert(`Gagal menyimpan temuan: ${e.message}`);
    }
  };
  
  const handleUpdateFinding = async (updatedData: Partial<Finding>) => {
    if (!selectedFinding) return;

    let newFinding: Finding = { ...selectedFinding, ...updatedData };
    
    // Auto-update status logic
    if ('status_verifikasi' in updatedData) {
        newFinding.status_akhir = updatedData.status_verifikasi === 'Sesuai' ? 'Selesai' : 'Proses RTL';
    } else if ('rencana_tindakan' in updatedData || 'tanggal_target_rtl' in updatedData || 'bukti_rtl' in updatedData) {
        if (newFinding.status_akhir === 'Terbuka') {
            newFinding.status_akhir = 'Proses RTL';
        }
    }
    
    // Add descriptive history log
    let action = `Memperbarui bidang: ${Object.keys(updatedData).join(', ')}`;
    if ('bukti_rtl' in updatedData && updatedData.bukti_rtl) {
      action = `Mengunggah bukti perbaikan: ${updatedData.bukti_rtl}`;
    } else if ('status_verifikasi' in updatedData) {
      action = `Melakukan verifikasi dengan status: "${updatedData.status_verifikasi}"`;
    }

    const newHistoryEntry = { id: Date.now(), user: userName, role: userRole, action, timestamp: new Date().toISOString() };
    newFinding.history = [newHistoryEntry, ...(newFinding.history || [])];

    try {
      const saved = await apiService.saveFinding(newFinding);
      setFindings(prev => prev.map(f => (f.id === saved.id ? saved : f)));
    } catch (e: any) {
      alert(`Gagal memperbarui temuan: ${e.message}`);
    }
  };
  
  const getStatusChip = (status: string) => {
    switch(status) {
      case 'Selesai': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Proses RTL': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Terverifikasi': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case 'Terbuka':
      default:
        return 'bg-amber-100 text-amber-700 border-amber-200';
    }
  };

  const openAddModal = () => {
    setEditingFinding(null);
    setIsModalOpen(true);
  }
  
  const openEditModal = (finding: Finding) => {
    setEditingFinding(finding);
    setIsModalOpen(true);
  };

  const getHistoryIcon = (action: string) => {
    if (action.includes('dibuat')) return <PlusCircle size={16} className="text-blue-500"/>;
    if (action.includes('diperbarui') || action.includes('Memperbarui')) return <Edit size={16} className="text-amber-500"/>;
    if (action.includes('verifikasi')) return <CheckCircle size={16} className="text-emerald-500"/>;
    if (action.includes('unggah')) return <Upload size={16} className="text-indigo-500"/>;
    return <History size={16} className="text-slate-500"/>;
  }
  
  const prodiUnits = units.filter(u => u.jenis_unit === 'prodi');
  const pendukungUnits = units.filter(u => u.jenis_unit === 'pendukung');
  const manajemenUnits = units.filter(u => u.jenis_unit === 'Manajemen');

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Manajemen Temuan & RTL</h2>
          <p className="text-sm text-slate-500 font-medium">Kelola ketidaksesuaian hasil audit dan Rencana Tindak Lanjut.</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <button onClick={() => handleExport('excel')} className="px-4 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold shadow-sm flex-1 flex items-center justify-center gap-2"><FileSpreadsheet size={16}/> Excel</button>
          <button onClick={openAddModal} className="px-6 py-3 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 flex-[2]">
            <Plus size={16} /> Tambah Temuan
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1"><Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" /><input type="text" placeholder="Cari berdasarkan uraian temuan..." className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} /></div>
            <div className="relative"><AlertTriangle size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" /><select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="w-full md:w-56 appearance-none pl-12 pr-10 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"><option value="">Semua Jenis</option><option value={FindingType.MAJOR}>Major</option><option value={FindingType.MINOR}>Minor</option><option value={FindingType.OBS}>Observasi</option></select><ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" /></div>
            <div className="relative"><Building2 size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <select value={filterUnit} onChange={(e) => setFilterUnit(e.target.value)} className="w-full md:w-72 appearance-none pl-12 pr-10 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer">
                    <option value="">Semua Unit Kerja</option>
                    {prodiUnits.length > 0 && (
                        <optgroup label="Program Studi">
                            {prodiUnits.map(unit => (<option key={unit.id} value={unit.nama_unit}>{unit.kode_unit} - {unit.nama_unit}</option>))}
                        </optgroup>
                    )}
                    {pendukungUnits.length > 0 && (
                        <optgroup label="Unit Pendukung">
                            {pendukungUnits.map(unit => (<option key={unit.id} value={unit.nama_unit}>{unit.kode_unit} - {unit.nama_unit}</option>))}
                        </optgroup>
                    )}
                    {manajemenUnits.length > 0 && (
                        <optgroup label="Manajemen">
                            {manajemenUnits.map(unit => (<option key={unit.id} value={unit.nama_unit}>{unit.kode_unit} - {unit.nama_unit}</option>))}
                        </optgroup>
                    )}
                </select>
                <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>
          <div className="max-h-[600px] overflow-y-auto space-y-4 pr-2 custom-scrollbar">
            {isLoading ? <div className="text-center py-20"><Loader2 className="animate-spin text-indigo-500" /></div> : error ? <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-center text-rose-600 font-bold text-sm">{error}</div> : filteredFindings.map(f => (
              <div key={f.id} onClick={() => handleSelectFinding(f)} className={`p-5 bg-white border rounded-2xl cursor-pointer transition-all ${selectedFinding?.id === f.id ? 'border-indigo-500 ring-4 ring-indigo-50 shadow-lg' : 'hover:border-indigo-300'}`}>
                <div className="flex justify-between items-start gap-4">
                   <div className="flex gap-3 flex-1"><AlertTriangle className={`mt-1 flex-shrink-0 ${f.tipe === FindingType.MAJOR ? 'text-rose-500' : 'text-amber-500'}`} />
                      <div>
                         <p className="text-[10px] font-black uppercase text-slate-400">{f.unit}</p>
                         <p className="font-bold text-slate-800 text-sm leading-snug">{f.uraian}</p>
                      </div>
                   </div>
                   <span className={`px-2 py-1 text-[9px] font-black rounded border uppercase tracking-wider whitespace-nowrap ${getStatusChip(f.status_akhir)}`}>{f.status_akhir}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm h-fit sticky top-4 flex flex-col">
          {!selectedFinding ? (<div className="text-center py-20 text-slate-400 text-xs italic">Pilih temuan untuk melihat detail.</div>) : (
             <>
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <div>
                  <span className={`px-2 py-1 text-[9px] font-black rounded border uppercase tracking-wider mb-2 inline-block ${getStatusChip(selectedFinding.status_akhir)}`}>{selectedFinding.status_akhir}</span>
                  <h3 className="font-bold text-slate-900 leading-tight">Detail & Tindak Lanjut</h3>
                </div>
                <button onClick={() => openEditModal(selectedFinding)} className="p-3 bg-slate-50 rounded-full text-slate-500 hover:bg-indigo-100 hover:text-indigo-600 transition-colors" aria-label="Edit temuan">
                  <Edit size={16} />
                </button>
              </div>
              <div className="flex border-b border-slate-100 bg-slate-50/50 p-1">
                {[{id: 'detail', label: 'Detail'}, {id: 'rtl', label: 'Tindak Lanjut'}, {id: 'verifikasi', label: 'Verifikasi'}, {id: 'history', label: 'Riwayat'}].map(tab => (
                  <button key={tab.id} onClick={() => setDetailTab(tab.id as any)} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${detailTab === tab.id ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:bg-slate-100'}`}>{tab.label}</button>
                ))}
              </div>
              
              <div className="p-6 space-y-4 overflow-y-auto max-h-[550px]">
                {detailTab === 'detail' && (<>
                  <div className="space-y-1"> <label className="text-[10px] text-slate-400 font-bold uppercase">Uraian</label> <p className="text-sm text-slate-700 font-medium bg-slate-50 p-3 rounded-lg">{selectedFinding.uraian}</p></div>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-1"> <label className="text-[10px] text-slate-400 font-bold uppercase">Standar</label> <p className="text-sm font-mono text-slate-700 bg-slate-50 p-2 rounded-lg">{selectedFinding.standar}</p></div>
                     <div className="space-y-1"> <label className="text-[10px] text-slate-400 font-bold uppercase">Jenis</label> <p className="text-sm font-bold text-slate-700 bg-slate-50 p-2 rounded-lg uppercase">{selectedFinding.tipe}</p></div>
                  </div>
                  <div className="pt-4 mt-4 border-t border-slate-100">
                     <div className="flex justify-between items-center"><h4 className="text-sm font-bold flex items-center gap-2"><Cpu size={16} className="text-indigo-600"/> Analisis AI</h4> <button onClick={() => handleAnalyzeWithAI(selectedFinding)} className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase flex items-center gap-1 hover:bg-indigo-100"><Sparkles size={12}/> Generate</button></div>
                     {isAnalyzing ? <div className="text-center py-6 text-indigo-400 text-xs font-bold uppercase tracking-widest">Menganalisis...</div> : aiResult && (
                       <div className="space-y-2 mt-2 animate-in slide-in-from-bottom-2">
                          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl"><label className="text-[10px] font-black text-emerald-500 uppercase">Akar Masalah:</label><p className="text-xs mt-1 text-emerald-900">{aiResult.akar_masalah}</p></div>
                          <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl"><label className="text-[10px] font-black text-indigo-500 uppercase">Rekomendasi:</label><p className="text-xs mt-1 text-indigo-900">{aiResult.tindakan_koreksi}</p></div>
                       </div>
                    )}
                  </div>
                </>)}
                
                {detailTab === 'rtl' && (<>
                  <div> <label className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1"><ClipboardCheck size={12}/> Rencana Tindak Lanjut</label> <textarea value={selectedFinding.rencana_tindakan || ''} onBlur={(e) => handleUpdateFinding({ rencana_tindakan: e.target.value })} onChange={(e) => setSelectedFinding({...selectedFinding, rencana_tindakan: e.target.value})} rows={4} className="w-full bg-slate-50 border p-3 mt-1 rounded-lg text-sm disabled:bg-slate-100 disabled:text-slate-500" disabled={!canEditRTL} placeholder={canEditRTL ? "Jelaskan langkah perbaikan..." : "Belum diisi"}/> </div>
                  <div> <label className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1"><Calendar size={12}/> Target Selesai</label> <input type="date" value={selectedFinding.tanggal_target_rtl || ''} onBlur={(e) => handleUpdateFinding({ tanggal_target_rtl: e.target.value })} onChange={(e) => setSelectedFinding({...selectedFinding, tanggal_target_rtl: e.target.value})} className="w-full bg-slate-50 border p-3 mt-1 rounded-lg text-sm disabled:bg-slate-100" disabled={!canEditRTL} /></div>
                  <div>
                    <label className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1"><Paperclip size={12}/> Bukti Perbaikan</label>
                    {selectedFinding.bukti_rtl ? (
                        <div className="mt-1 bg-slate-50 border p-3 rounded-lg text-sm flex items-center justify-between">
                            <span className="font-bold text-slate-700 truncate pr-4">{selectedFinding.bukti_rtl}</span>
                            <button onClick={() => handlePreview(selectedFinding.bukti_rtl!)} className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-black text-indigo-600 hover:bg-indigo-50 flex-shrink-0 flex items-center gap-1">
                                <Eye size={12}/> Lihat Pratinjau
                            </button>
                        </div>
                    ) : (
                        <div className="mt-1 bg-slate-50 border p-3 rounded-lg text-sm text-slate-400 italic">Belum ada bukti yang diunggah.</div>
                    )}
                    {canEditRTL && (
                        <label className="mt-2 text-xs text-indigo-600 font-bold flex items-center gap-1 cursor-pointer hover:underline">
                            <Upload size={14}/> {selectedFinding.bukti_rtl ? 'Ganti' : 'Unggah'} File
                            <input type="file" className="hidden" onChange={(e) => e.target.files && handleUpdateFinding({ bukti_rtl: e.target.files[0].name })}/>
                        </label>
                    )}
                  </div>
                </>)}
                
                {detailTab === 'verifikasi' && (<>
                  <div> <label className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1"><UserCheck size={12}/> Catatan Verifikasi Auditor</label> <textarea value={selectedFinding.catatan_verifikasi || ''} onBlur={(e) => handleUpdateFinding({ catatan_verifikasi: e.target.value })} onChange={(e) => setSelectedFinding({...selectedFinding, catatan_verifikasi: e.target.value})} rows={4} className="w-full bg-slate-50 border p-3 mt-1 rounded-lg text-sm disabled:bg-slate-100" disabled={!canVerify} placeholder={canVerify ? "Tulis hasil verifikasi bukti..." : "Belum diverifikasi"}/> </div>
                  <div> <label className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1"><Check size={12}/> Status Verifikasi</label>
                    <select value={selectedFinding.status_verifikasi} onBlur={(e) => handleUpdateFinding({ status_verifikasi: e.target.value })} onChange={(e) => setSelectedFinding({...selectedFinding, status_verifikasi: e.target.value})} className="w-full bg-slate-50 border p-3 mt-1 rounded-lg text-sm font-bold disabled:bg-slate-100" disabled={!canVerify}>
                      <option>Menunggu</option><option>Sesuai</option><option>Tidak Sesuai</option>
                    </select>
                  </div>
                </>)}

                {detailTab === 'history' && (
                  <div className="relative space-y-6">
                    <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-slate-100"></div>
                    {selectedFinding.history?.length > 0 ? (
                      selectedFinding.history.map((log: any) => (
                        <div key={log.id} className="relative z-10 flex items-start gap-4">
                           <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center border-4 border-white shadow-sm flex-shrink-0">
                              {getHistoryIcon(log.action)}
                           </div>
                           <div>
                              <p className="text-xs text-slate-600 leading-snug">
                                 <span className="font-bold text-slate-800">{log.user}</span>
                                 <span className="text-slate-500 mx-1">({log.role})</span>
                                 {log.action}
                              </p>
                              <p className="text-[10px] text-slate-400 font-bold mt-1">{formatRelativeTime(log.timestamp)}</p>
                           </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400 italic text-center py-8">Tidak ada riwayat perubahan.</p>
                    )}
                  </div>
                )}
              </div>
             </>
          )}
        </div>
      </div>
      
      <AddFindingModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setEditingFinding(null); }} 
        onSave={handleSaveFinding} 
        findingToEdit={editingFinding}
        units={units}
      />
      
      {/* PREVIEW MODAL */}
      {isPreviewModalOpen && previewFile && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm" onClick={() => setIsPreviewModalOpen(false)} />
          <div className="relative bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b flex justify-between items-center bg-slate-50 flex-shrink-0">
              <h3 className="text-sm font-bold text-slate-800 truncate">{previewFile.name}</h3>
              <button onClick={() => setIsPreviewModalOpen(false)} className="p-2 text-slate-400 hover:bg-slate-200 rounded-full"><X size={18}/></button>
            </div>
            <div className="p-8 flex-1 overflow-auto flex items-center justify-center">
              {previewFile.type === 'image' ? (
                <img src={`https://picsum.photos/seed/${previewFile.name}/1200/800`} alt={`Pratinjau ${previewFile.name}`} className="max-w-full max-h-full object-contain rounded-lg"/>
              ) : (
                <div className="text-center text-slate-400 space-y-4">
                   <FileText size={64} className="mx-auto"/>
                   <h4 className="font-bold text-slate-600">Pratinjau Tidak Tersedia</h4>
                   <p className="text-xs">File ini bukan gambar dan tidak dapat ditampilkan. Silakan unduh untuk melihat isinya.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
export default FindingsView;
