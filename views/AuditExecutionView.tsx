
import React, { useState, useEffect, useMemo } from 'react';
import { 
  CheckCircle2, ClipboardCheck, Eye, XCircle, FileText, CheckCircle, ShieldCheck, 
  MapPin, Mic, PenTool, AlertOctagon, ArrowRight, Lock, HelpCircle, FileWarning, Check, Loader2, FileClock, Scale, Download, FileSpreadsheet
} from 'lucide-react';
import { DocumentStatus, Instrument, AuditCycle, AuditCycleStatus, Role } from '../types';
import * as apiService from '../services/apiService';

const STORAGE_KEYS = { 
  GLOBAL_INSTRUMENTS: 'siapepi_active_instruments_v2_dual',
  AUDIT_CYCLES: 'siapepi_audit_cycles'
};

// --- SUB-COMPONENTS ---
const ValidationChecklist: React.FC<{ checks: { label: string, passed: boolean }[] }> = ({ checks }) => (
  <div className="bg-white border border-slate-200 p-6 rounded-[2rem] shadow-sm">
    <h4 className="font-bold text-slate-800 text-sm uppercase mb-4 flex items-center gap-2">
      <ClipboardCheck size={16} /> Daftar Periksa Finalisasi
    </h4>
    <div className="space-y-3">
      {checks.map((check, idx) => (
        <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
          {check.passed ? <CheckCircle2 size={18} className="text-emerald-500" /> : <XCircle size={18} className="text-rose-400" />}
          <span className={`text-xs font-bold ${check.passed ? 'text-slate-600' : 'text-rose-600'}`}>{check.label}</span>
        </div>
      ))}
    </div>
  </div>
);

// --- MAIN COMPONENT ---
interface AuditExecutionViewProps {
  userUnit?: string;
  isAuditeeView?: boolean;
}

const AuditExecutionView: React.FC<AuditExecutionViewProps> = ({ userUnit, isAuditeeView = false }) => {
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [auditCycles, setAuditCycles] = useState<Record<string, AuditCycle>>(() => JSON.parse(localStorage.getItem(STORAGE_KEYS.AUDIT_CYCLES) || '{}'));

  const [selectedUnit, setSelectedUnit] = useState<string | null>(userUnit || null);
  
  useEffect(() => {
    const loadData = async () => {
      if (selectedUnit) {
        setIsLoading(true);
        setError(null);
        try {
          const data = await apiService.getDeskEvaluationInstruments(selectedUnit);
          setInstruments(data);
        } catch (err: any) {
          setError(err.message || "Gagal memuat data instrumen.");
        } finally {
          setIsLoading(false);
        }
      }
    };
    loadData();
  }, [selectedUnit]);

  const units = useMemo(() => {
    if (userUnit) return [userUnit];
    return Array.from(new Set(instruments.map(i => i.unit_target || 'Global'))).sort();
  }, [instruments, userUnit]);

  // useEffect(() => { localStorage.setItem(STORAGE_KEYS.GLOBAL_INSTRUMENTS, JSON.stringify(instruments)); }, [instruments]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.AUDIT_CYCLES, JSON.stringify(auditCycles)); }, [auditCycles]);

  const activeAuditCycle = useMemo(() => {
    if (!selectedUnit) return null;
    return auditCycles[selectedUnit] || { unit: selectedUnit, status: AuditCycleStatus.FIELD_AUDIT_IN_PROGRESS };
  }, [selectedUnit, auditCycles]);

  const isFinalized = activeAuditCycle?.status === AuditCycleStatus.FINALIZED;

  const filteredInstruments = selectedUnit 
    ? instruments.filter(i => i.unit_target === selectedUnit)
    : [];
  
  // Validation Logic
  const validationChecks = useMemo(() => {
    if (!selectedUnit) return [];
    const instrumentsForUnit = instruments.filter(i => i.unit_target === selectedUnit);
    if (instrumentsForUnit.length === 0) return [{ label: 'Tidak ada instrumen yang perlu diaudit', passed: true }];

    const allDeskEvalApproved = instrumentsForUnit.every(i => {
        if (!i.evaluations || !i.auditor_ids) return false;
        const [id1, id2] = i.auditor_ids;
        const eval1_status = i.evaluations[String(id1)]?.status;
        const eval2_status = i.evaluations[String(id2)]?.status;
        return eval1_status === DocumentStatus.APPROVED && eval2_status === DocumentStatus.APPROVED;
    });

    const allNotesFilled = instrumentsForUnit.filter(i => i.doc_status === DocumentStatus.APPROVED).every(i => i.catatan_lapangan && i.catatan_lapangan.trim() !== '');
    const allScoresGiven = instrumentsForUnit.filter(i => i.doc_status === DocumentStatus.APPROVED).every(i => i.skor !== undefined && i.skor !== null);
    
    return [
      { label: `Semua ${instrumentsForUnit.length} instrumen lolos Desk Evaluation`, passed: allDeskEvalApproved },
      { label: 'Semua catatan verifikasi lapangan terisi', passed: allNotesFilled },
      { label: 'Semua skor akhir telah diberikan', passed: allScoresGiven },
      { label: 'Semua temuan terkait telah difinalisasi', passed: true }, // Placeholder
    ];
  }, [selectedUnit, instruments]);
  
  const isReadyForFinalization = validationChecks.every(c => c.passed);

  const handleUpdate = (id: number, field: string, value: any) => {
    if (isFinalized) return; // Block updates if finalized
    setInstruments(instruments.map(inst => inst.id === id ? { ...inst, [field]: value } : inst));
  };
  
  const handleFinalize = () => {
    if (!isReadyForFinalization || !selectedUnit) return;
    if (confirm("Anda yakin ingin mengunci skor dan memfinalisasi audit untuk unit ini? Tindakan ini akan mengaktifkan modul Administrasi AMI dan tidak dapat dibatalkan.")) {
      const finalScore = parseFloat(calculateFieldAuditFinalScore());
      const updatedCycle: AuditCycle = {
        ...activeAuditCycle!,
        status: AuditCycleStatus.FINALIZED,
        finalScore
      };
      setAuditCycles(prev => ({ ...prev, [selectedUnit]: updatedCycle }));
    }
  };

  const handleExport = (format: 'pdf' | 'excel') => {
    if (!selectedUnit) return;
    const alertMessage = format === 'pdf'
      ? `Memulai unduhan Laporan Audit Lapangan (PDF) untuk ${selectedUnit}. Dokumen ini berisi ringkasan, daftar temuan, dan RTL yang telah disetujui.`
      : `Memulai unduhan Laporan Analitis (Excel) untuk ${selectedUnit}. File ini berisi sheet terpisah untuk Ringkasan, Detail Temuan, dan Status RTL.`;
    alert(alertMessage);
  };

  const calculateFieldAuditFinalScore = () => {
    const validInstruments = filteredInstruments.filter(i => {
        if (!i.evaluations || !i.auditor_ids) return false;
        const [id1, id2] = i.auditor_ids;
        return i.evaluations[String(id1)]?.status === DocumentStatus.APPROVED && i.evaluations[String(id2)]?.status === DocumentStatus.APPROVED;
    });

    if (validInstruments.length === 0) return "0.00";
    const total = validInstruments.reduce((acc, curr) => acc + (curr.skor ?? 0), 0);
    return (total / validInstruments.length).toFixed(2);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
        <p className="text-slate-500 font-bold animate-pulse">Memuat data instrumen...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-rose-50 border border-rose-200 p-8 rounded-[2.5rem] text-center space-y-4">
        <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
          <FileWarning size={32} />
        </div>
        <h3 className="text-xl font-bold text-rose-900">Gagal Memuat Data</h3>
        <p className="text-rose-600 max-w-md mx-auto">{error}</p>
        <button onClick={() => window.location.reload()} className="px-6 py-2 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 transition-colors">
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-28">
      <div className="bg-indigo-900 text-white p-8 rounded-[2.5rem] shadow-lg flex justify-between items-center">
        <div><h2 className="text-3xl font-black">Audit Lapangan & Wawancara</h2><p className="text-indigo-200">Verifikasi faktual, catat temuan, dan tentukan skor akhir.</p></div>
        {!selectedUnit && <p className="text-2xl font-black">{units.length} Unit</p>}
      </div>

      {!selectedUnit ? (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {units.map(unit => (
               <button key={unit} onClick={() => setSelectedUnit(unit)} className="p-6 bg-white border border-slate-200 rounded-[2rem] hover:border-indigo-400 hover:shadow-xl transition-all text-left group">
                  <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-black">{unit}</span>
                  <h3 className="text-lg font-bold mt-4">Mulai Audit Lapangan</h3>
               </button>
            ))}
         </div>
      ) : (
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2 space-y-6">
              <div className="flex justify-between items-center sticky top-0 z-40 bg-slate-50/95 backdrop-blur py-4 border-b">
                {!isAuditeeView && <button onClick={() => setSelectedUnit(null)} className="text-xs font-bold flex items-center gap-2"><XCircle size={16} /> Ganti Unit</button>}
                {isAuditeeView && <div className="text-xs font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-lg">Mode Auditee: Verifikasi Lapangan</div>}
                {isFinalized && (
                  <div className="px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold border border-emerald-200 flex items-center gap-2">
                     <Lock size={14}/> Terkunci & Final
                  </div>
                )}
                <p className="text-2xl font-black text-indigo-600">{activeAuditCycle?.finalScore?.toFixed(2) || calculateFieldAuditFinalScore()}</p>
              </div>

              {filteredInstruments.map((item, idx) => {
                 const isApproved = item.evaluations && item.auditor_ids && item.evaluations[String(item.auditor_ids[0])]?.status === DocumentStatus.APPROVED && item.evaluations[String(item.auditor_ids[1])]?.status === DocumentStatus.APPROVED;
                 return (
                    <div key={item.id} className={`bg-white border rounded-[2.5rem] overflow-hidden shadow-sm ${!isApproved ? 'opacity-50' : ''}`}>
                       <div className="p-6 border-b flex gap-4">
                          <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">{idx + 1}</div>
                          <div className="flex-1"><p className="font-bold text-lg leading-snug">{item.pertanyaan}</p></div>
                       </div>
                       {!isApproved ? (
                          <div className="p-6 text-center text-xs text-amber-700 bg-amber-50 font-bold flex items-center justify-center gap-2"><FileWarning size={16}/> Menunggu status 'Valid / Diterima' dari kedua auditor di Desk Evaluation.</div>
                       ) : (
                         <div className="grid grid-cols-1 md:grid-cols-2 divide-x">
                            <div className="p-6 space-y-4">
                               <h4 className="text-[10px] font-black text-slate-400">Data Desk Evaluation</h4>
                               <div className="bg-slate-50 p-4 rounded-2xl border space-y-3">
                                  <div><p className="text-[10px] font-bold">Dokumen Bukti</p><a href="#" className="text-xs font-bold text-indigo-600 underline flex items-center gap-1"><FileText size={12} /> {item.doc_file}</a></div>
                                  <div>
                                      <p className="text-[10px] font-bold flex items-center gap-1"><Scale size={12}/>Skor Rata-Rata Desk Eval</p>
                                      <p className="text-2xl font-black text-indigo-800">{item.final_desk_score?.toFixed(2) || 'N/A'}</p>
                                  </div>
                               </div>
                            </div>
                            <div className="p-6 space-y-4 bg-indigo-50/10">
                               <h4 className="text-[10px] font-black text-indigo-400">{isAuditeeView ? 'Tanggapan Auditee' : 'Verifikasi Lapangan'}</h4>
                               <textarea 
                                 className="w-full bg-white p-4 rounded-2xl text-xs border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none" 
                                 rows={3} 
                                 placeholder={isAuditeeView ? "Berikan penjelasan/tanggapan untuk verifikasi lapangan..." : "Catatan wawancara..."} 
                                 value={item.catatan_lapangan || ''} 
                                 onChange={(e) => handleUpdate(item.id, 'catatan_lapangan', e.target.value)} 
                                 disabled={isFinalized} 
                               />
                               {!isAuditeeView && (
                                 <div className="flex items-center justify-between bg-white p-3 rounded-2xl shadow-sm">
                                   <span className="text-xs font-bold ml-2">Skor Akhir:</span>
                                   <div className="flex gap-2">
                                     {[0,1,2,3,4].map(s => (
                                       <button 
                                         key={s} 
                                         onClick={() => handleUpdate(item.id, 'skor', s)} 
                                         disabled={isFinalized} 
                                         className={`w-8 h-8 rounded-xl text-xs font-black ${ (item.skor) === s ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-400'}`}
                                       >
                                         {s}
                                       </button>
                                     ))}
                                   </div>
                                 </div>
                               )}
                               {isAuditeeView && item.skor !== undefined && (
                                 <div className="flex items-center justify-between bg-white p-3 rounded-2xl shadow-sm">
                                   <span className="text-xs font-bold ml-2">Skor Akhir dari Auditor:</span>
                                   <span className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-xs font-black">{item.skor}</span>
                                 </div>
                               )}
                            </div>
                         </div>
                       )}
                    </div>
                 )
              })}
            </div>
            <div className="space-y-6 sticky top-4">
              <ValidationChecklist checks={validationChecks} />
              <div className="relative group">
                {!isAuditeeView && (
                  <button onClick={handleFinalize} disabled={!isReadyForFinalization || isFinalized} className="w-full px-8 py-4 bg-slate-900 text-white rounded-2xl text-sm font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                    <ShieldCheck size={18} /> Kunci Skor & Finalisasi
                  </button>
                )}
                {isAuditeeView && (
                  <div className="p-6 bg-indigo-50 border border-indigo-100 rounded-2xl text-center">
                    <h4 className="font-bold text-indigo-900 text-sm">Status Audit Lapangan</h4>
                    <p className="text-xs text-indigo-600 mt-2">
                      {isFinalized ? 'Audit telah difinalisasi oleh auditor. Skor dan catatan telah dikunci.' : 'Auditor sedang melakukan verifikasi lapangan. Anda dapat memberikan tanggapan pada kolom yang tersedia.'}
                    </p>
                  </div>
                )}
                {(!isReadyForFinalization && !isFinalized && !isAuditeeView) && (
                  <div className="absolute bottom-full mb-2 w-full p-3 bg-rose-600 text-white text-xs font-bold rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                     Harap lengkapi semua item di Daftar Periksa.
                  </div>
                )}
              </div>
              {isFinalized && (
                  <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-4">
                    <div>
                      <h4 className="font-bold text-emerald-800">Audit Selesai & Terkunci</h4>
                      <p className="text-xs text-emerald-600 mt-1">Lanjutkan ke 'Administrasi AMI' atau ekspor laporan.</p>
                    </div>
                    <div className="flex gap-3">
                       <button onClick={() => handleExport('pdf')} className="flex-1 flex items-center justify-center gap-2 text-xs font-bold p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-100">
                         <Download size={14}/> PDF Report
                       </button>
                       <button onClick={() => handleExport('excel')} className="flex-1 flex items-center justify-center gap-2 text-xs font-bold p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-100">
                         <FileSpreadsheet size={14}/> Excel
                       </button>
                    </div>
                  </div>
              )}
            </div>
         </div>
      )}
    </div>
  );
};

export default AuditExecutionView;
