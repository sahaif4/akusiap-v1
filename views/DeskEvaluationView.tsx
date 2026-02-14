
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Eye, CheckCircle2, XCircle, MessageSquare, FileText, ArrowRight, CornerUpLeft, 
  ClipboardCheck, AlertTriangle, Info, ShieldCheck, Search, Send, RefreshCw, FileWarning, Edit, Users, GitCommitVertical, AlertOctagon, Scale, Save, Link as LinkIcon, Loader2, Lock, ShieldAlert, ClipboardList, ServerCrash, Clock, FileSignature, PenLine, ChevronDown
} from 'lucide-react';
import { DocumentStatus, Instrument, AuditCycle, AuditCycleStatus, AuditorEvaluation, CurrentUser, Role, UnitSubmissionStatus, User } from '../types';
import * as apiService from '../services/apiService';

const SCORE_CONFLICT_THRESHOLD = 0.25;

// --- SUB-COMPONENTS ---
const DeskEvalHeader: React.FC<{ cycle: AuditCycle | null, unitName: string, submissionStatus: UnitSubmissionStatus | null }> = ({ cycle, unitName, submissionStatus }) => {
    if (!cycle) return null;

    const deadline = new Date();
    deadline.setDate(deadline.getDate() + 5);
    const daysRemaining = 5;
    const deadlineColor = daysRemaining > 3 ? 'text-emerald-600 bg-emerald-50 border-emerald-200' : 'text-amber-600 bg-amber-50 border-amber-200';
    
    const getStatusChip = (status: UnitSubmissionStatus | null) => {
        if (!status) return { text: 'Memuat...', color: 'bg-slate-100 text-slate-600' };
        switch(status) {
          case UnitSubmissionStatus.DRAFT: return { text: 'Draft', color: 'bg-slate-100 text-slate-600' };
          case UnitSubmissionStatus.SUBMITTED: return { text: 'Terkirim', color: 'bg-emerald-100 text-emerald-700' };
          case UnitSubmissionStatus.RETURNED: return { text: 'Dikembalikan', color: 'bg-amber-100 text-amber-700' };
          default: return { text: status, color: 'bg-blue-100 text-blue-700' };
        }
    };
    const statusChip = getStatusChip(submissionStatus);


    return (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm mb-6 flex flex-col md:flex-row justify-between items-start gap-4">
            <div>
                <h3 className="font-bold text-sm uppercase text-slate-500 tracking-wider">Workspace Desk Evaluation</h3>
                <div className="flex items-center gap-3">
                    <p className="text-2xl font-black text-slate-900">{unitName}</p>
                    <span className={`px-2 py-1 rounded-full text-[9px] font-bold border ${statusChip.color}`}>{statusChip.text}</span>
                </div>
                <span className="text-xs font-bold text-slate-400">Auditee menyerahkan berkas 2 jam yang lalu.</span>
            </div>
            <div className={`p-4 rounded-xl border ${deadlineColor} text-center`}>
                <p className="text-[10px] font-black uppercase tracking-widest">Sisa Waktu Evaluasi</p>
                <p className="text-2xl font-black">{daysRemaining} Hari</p>
            </div>
        </div>
    );
};


const FinalizationPanel: React.FC<{
    onFinalize: () => void;
    checks: { allEvaluated: boolean; noConflicts: boolean };
    isFinalized: boolean;
}> = ({ onFinalize, checks, isFinalized }) => {
    
    const canFinalize = checks.allEvaluated && checks.noConflicts;

    if (isFinalized) {
        return (
            <div className="p-6 rounded-3xl bg-emerald-50 border-emerald-200 text-center">
                <CheckCircle2 size={32} className="mx-auto text-emerald-600 mb-2"/>
                <h3 className="font-bold text-emerald-800">Desk Evaluation Selesai & Terkunci</h3>
                <p className="text-xs text-emerald-600 mt-1">Siklus audit dapat dilanjutkan ke tahap Audit Lapangan.</p>
            </div>
        );
    }
    
    return (
        <div className="p-6 rounded-3xl bg-indigo-50 border-2 border-dashed border-indigo-200">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                    <h3 className="text-lg font-black text-indigo-900 flex items-center gap-2"><ShieldAlert size={20}/> Tanda Tangan & Finalisasi</h3>
                    <p className="text-xs text-indigo-700 mt-1">Setelah semua penilaian final dan konflik terselesaikan, dokumen dapat ditandatangani.</p>
                </div>
                <button onClick={onFinalize} disabled={!canFinalize} className="px-6 py-3 bg-indigo-600 text-white rounded-2xl text-sm font-bold shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                    <FileSignature size={18}/> Kunci & Minta TTD
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-indigo-100">
                <div className={`flex items-start gap-3 p-3 rounded-xl ${checks.allEvaluated ? 'bg-emerald-50' : 'bg-slate-50'}`}>
                    {checks.allEvaluated ? <CheckCircle2 className="text-emerald-500 mt-0.5"/> : <XCircle className="text-rose-400 mt-0.5"/>}
                    <p className="text-xs font-bold">{checks.allEvaluated ? 'Semua instrumen telah dievaluasi oleh kedua auditor.' : 'Beberapa instrumen belum selesai dievaluasi.'}</p>
                </div>
                <div className={`flex items-start gap-3 p-3 rounded-xl ${checks.noConflicts ? 'bg-emerald-50' : 'bg-amber-50'}`}>
                    {checks.noConflicts ? <CheckCircle2 className="text-emerald-500 mt-0.5"/> : <AlertTriangle className="text-amber-500 mt-0.5"/>}
                    <p className="text-xs font-bold">{checks.noConflicts ? 'Tidak ada konflik skor yang signifikan.' : 'Masih terdapat konflik skor yang perlu didiskusikan.'}</p>
                </div>
            </div>
        </div>
    );
};

const StatusPlaceholder: React.FC<{ status: UnitSubmissionStatus, onRefresh: () => void }> = ({ status, onRefresh }) => {
    const config = {
      [UnitSubmissionStatus.DRAFT]: { icon: <Clock size={40}/>, title: 'Menunggu Berkas dari Auditee', message: "Auditor dapat memulai evaluasi setelah auditee mengirimkan semua dokumen bukti." },
      [UnitSubmissionStatus.READY_TO_SUBMIT]: { icon: <Clock size={40}/>, title: 'Menunggu Berkas dari Auditee', message: "Auditee sedang bersiap mengirimkan berkas. Mohon tunggu sebentar." },
      [UnitSubmissionStatus.RETURNED]: { icon: <RefreshCw size={40}/>, title: 'Berkas Dikembalikan ke Auditee', message: "Dokumen telah dikembalikan untuk revisi. Workspace akan terbuka kembali setelah Auditee mengirim ulang." }
    };
    const current = config[status] || config[UnitSubmissionStatus.DRAFT];

    return (
        <div className="text-center py-20 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-slate-400 mb-6 shadow-inner border">
                {current.icon}
            </div>
            <h3 className="font-black text-xl text-slate-700">{current.title}</h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto mt-2">{current.message}</p>
            <button onClick={onRefresh} className="mt-6 px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold flex items-center gap-2">
                <RefreshCw size={14}/> Refresh Status
            </button>
        </div>
    );
};


// --- MAIN COMPONENT ---
interface DeskEvaluationViewProps {
  currentUser: CurrentUser | null;
}

const DeskEvaluationView: React.FC<DeskEvaluationViewProps> = ({ currentUser }) => {
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [auditCycles, setAuditCycles] = useState<Record<string, AuditCycle>>({});
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);
  const [activeInstrumentId, setActiveInstrumentId] = useState<number|null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submissionStatus, setSubmissionStatus] = useState<UnitSubmissionStatus | null>(null);
  const [allAuditors, setAllAuditors] = useState<User[]>([]);

  useEffect(() => {
    const fetchAuditors = async () => {
      try {
        const users = await apiService.getUsers();
        setAllAuditors(users.filter(u => u.role === Role.AUDITOR));
      } catch (e) {
        console.error("Gagal memuat data auditor", e);
      }
    };

    const fetchAuditCycles = async () => {
        try {
            // Get assignments for the current auditor to know which units they audit
            const assignments = await apiService.getAuditAssignments();
            const cycles: Record<string, AuditCycle> = {};
            
            assignments.forEach(a => {
                if (a.auditor1 === currentUser?.id || a.auditor2 === currentUser?.id) {
                    cycles[a.unit_name] = {
                        id: a.audit_cycle,
                        unit: a.unit_name,
                        status: a.status === 'FIELD_AUDIT' ? AuditCycleStatus.FIELD_AUDIT : 
                                a.status === 'FINISHED' ? AuditCycleStatus.FINISHED : 
                                AuditCycleStatus.DESK_EVALUATION_IN_PROGRESS,
                        name: a.audit_cycle_name
                    } as any;
                }
            });
            
            setAuditCycles(cycles);
        } catch (e) {
            console.error("Gagal memuat siklus audit", e);
            // Fallback to minimal state if needed, or error
        }
    };

    fetchAuditors();
    if (currentUser) fetchAuditCycles();
  }, [currentUser]);

  const fetchDataForUnit = async (unitName: string) => {
    if (!currentUser) return;
    setIsLoading(true); setError(null);
    try {
      const [instrumentsData, statusData] = await Promise.all([
        apiService.getDeskEvaluationInstruments(unitName),
        apiService.getAuditStatus(unitName)
      ]);

      setInstruments(instrumentsData);
      
      // Map backend status to frontend UnitSubmissionStatus
      // In this context, if status is FIELD_AUDIT or higher, it means auditee has submitted.
      if (statusData.status === 'FIELD_AUDIT' || statusData.status === 'FINISHED') {
          setSubmissionStatus(UnitSubmissionStatus.SUBMITTED);
      } else {
          // If still in DESK_EVALUATION, we might need to know if auditee has uploaded anything.
          // For now, assume if instruments have doc_file, it's submitted.
          const hasUploads = instrumentsData.some(i => i.doc_file);
          setSubmissionStatus(hasUploads ? UnitSubmissionStatus.SUBMITTED : UnitSubmissionStatus.DRAFT);
      }
    } catch (error: any) {
      setError(error.message || "Gagal memuat data instrumen.");
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (selectedUnit) {
      fetchDataForUnit(selectedUnit);
    } else {
      setInstruments([]);
      setSubmissionStatus(null);
    }
  }, [selectedUnit, currentUser]);
  
  const auditUnits = useMemo(() => Object.keys(auditCycles).filter(unitName => auditCycles[unitName].status === AuditCycleStatus.DESK_EVALUATION_IN_PROGRESS), [auditCycles]);
  const activeCycle = useMemo(() => selectedUnit ? auditCycles[selectedUnit] : null, [selectedUnit, auditCycles]);
  const isFinalized = activeCycle?.status !== AuditCycleStatus.DESK_EVALUATION_IN_PROGRESS;
  const showWorkspace = submissionStatus === UnitSubmissionStatus.SUBMITTED || submissionStatus === UnitSubmissionStatus.ACCEPTED;

  const handleFinalizeAll = async () => {
    if (!selectedUnit || !activeCycle) return;
    if (!window.confirm("Apakah Anda yakin ingin menyelesaikan Desk Evaluation untuk unit ini? Tahap Audit AMI (Lapangan) akan segera dimulai.")) return;
    
    setIsLoading(true);
    try {
        await apiService.finalizeDeskEvaluation(selectedUnit, activeCycle.id);
        
        // Update local state
        setAuditCycles(prev => ({
            ...prev,
            [selectedUnit]: { ...prev[selectedUnit], status: AuditCycleStatus.FIELD_AUDIT as any }
        }));
        
        alert("Desk Evaluation berhasil difinalisasi. Tahap Audit AMI telah diaktifkan.");
    } catch (e: any) {
        alert("Gagal memfinalisasi evaluasi: " + e.message);
    } finally {
        setIsLoading(false);
    }
  };

  const validationChecks = useMemo(() => {
    if (!currentUser || instruments.length === 0) return { allEvaluated: false, noConflicts: false };
    const allEvaluated = instruments.every(i => {
      const auditorIds = i.auditor_ids || [];
      const myId = String(currentUser.id);
      const peerId = auditorIds.find(id => String(id) !== myId);
      
      const myEval = i.evaluations?.[myId];
      const peerEval = peerId ? i.evaluations?.[String(peerId)] : null;
      
      return myEval?.isComplete && (peerId ? peerEval?.isComplete : true);
    });
    const noConflicts = instruments.every(i => !i.conflict);
    return { allEvaluated, noConflicts };
  }, [instruments, currentUser]);


  const handleEvaluationChange = (instrumentId: number, field: keyof AuditorEvaluation, value: any) => {
    if(isFinalized || !currentUser) return;
    setInstruments(prev => prev.map(inst => {
      if (inst.id === instrumentId) {
        const myEval = inst.evaluations?.[String(currentUser.id)] || { status: DocumentStatus.MISSING, isComplete: false };
        const updatedEval = { ...myEval, [field]: value };
        return { ...inst, evaluations: { ...inst.evaluations, [String(currentUser.id)]: updatedEval } };
      }
      return inst;
    }));
  };
  
  const handleSaveDraft = async (instrumentId: number) => {
    if (!currentUser) return;
    const inst = instruments.find(i => i.id === instrumentId);
    if (!inst || !inst.audit_response_id) return;

    const myEval = inst.evaluations?.[String(currentUser.id)];
    if (!myEval) return;

    try {
        await apiService.submitDeskScore({
            audit_response_id: inst.audit_response_id,
            auditor_id: currentUser.id,
            score: myEval.skor_desk,
            note: myEval.catatan_desk,
            status: myEval.status,
            doc_note: myEval.doc_note,
            isComplete: false,
        });
        alert(`Draf untuk instrumen ID ${instrumentId} berhasil disimpan.`);
    } catch (e: any) {
        alert(`Gagal menyimpan draf: ${e.message}`);
    }
  };
  
  const handleFinalizeEvaluation = async (instrumentId: number) => {
    if (!currentUser) return;
    const inst = instruments.find(i => i.id === instrumentId);
    if (!inst || !inst.audit_response_id) return;

    const myEval = inst.evaluations?.[String(currentUser.id)];
    if (!myEval) return;
    if (myEval.status === DocumentStatus.REJECTED && !myEval.doc_note?.trim()) {
      return alert('Alasan penolakan wajib diisi jika status "Perlu Revisi".');
    }

    if (!window.confirm("Anda yakin ingin memfinalisasi penilaian ini? Anda tidak akan dapat mengubahnya lagi.")) return;
    
    try {
       await apiService.submitDeskScore({
            audit_response_id: inst.audit_response_id,
            auditor_id: currentUser.id,
            score: myEval.skor_desk,
            note: myEval.catatan_desk,
            status: myEval.status,
            doc_note: myEval.doc_note,
            isComplete: true,
        });

        // Update local state to reflect finalization
        setInstruments(prev => prev.map(i => i.id === instrumentId ? { ...i, evaluations: { ...i.evaluations, [String(currentUser.id)]: { ...myEval, isComplete: true } } } : i));
    } catch(e: any) {
       alert(`Gagal finalisasi: ${e.message}`);
    }
  };

  if (!currentUser) {
    return <div className="text-center py-10"><Loader2 size={24} className="animate-spin text-indigo-500"/> Memuat data pengguna...</div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <h2 className="text-3xl font-black text-slate-900 tracking-tight">Desk Evaluation (Audit Kecukupan)</h2>
      {!selectedUnit ? (
        auditUnits.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {auditUnits.map(unit => (
              <button key={unit} onClick={() => setSelectedUnit(unit)} className="bg-white border border-slate-200 p-6 rounded-[2rem] text-left hover:border-indigo-300 hover:shadow-xl transition-all group relative overflow-hidden">
                  <h3 className="text-lg font-black text-slate-900">{unit}</h3>
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[3rem]"><h3 className="font-black text-xl text-slate-700">Tidak Ada Audit Aktif</h3></div>
        )
      ) : (
        <div className="space-y-6 animate-in slide-in-from-right-8 duration-500">
           <div className="flex items-center justify-between"><button onClick={() => setSelectedUnit(null)} className="flex items-center gap-2 text-xs font-bold"><CornerUpLeft size={16}/> Kembali</button></div>
           
           <DeskEvalHeader cycle={activeCycle} unitName={selectedUnit} submissionStatus={submissionStatus} />
           
           {isLoading ? <div className="text-center py-10"><Loader2 size={24} className="animate-spin text-indigo-500"/></div> :
           error ? <div className="flex flex-col items-center justify-center h-full min-h-[20vh] bg-rose-50 border border-rose-200 rounded-2xl p-8"><ServerCrash size={32} className="text-rose-400" /><h3 className="mt-2 text-md font-bold text-rose-800">{error}</h3></div> :
           !showWorkspace ? <StatusPlaceholder status={submissionStatus!} onRefresh={() => fetchDataForUnit(selectedUnit)} /> :
           (
            <>
              <FinalizationPanel checks={validationChecks} onFinalize={handleFinalizeAll} isFinalized={isFinalized}/>
              {instruments.map(inst => {
                  const myId = String(currentUser.id);
                  const auditorIds = inst.auditor_ids || [];
                  const peerAuditorId = auditorIds.find(id => String(id) !== myId);
                  
                  const myEval = inst.evaluations?.[myId] || { 
                      status: DocumentStatus.MISSING, 
                      skor_desk: 0, 
                      catatan_desk: '', 
                      doc_note: '', 
                      isComplete: false 
                  };
                  
                  const peerAuditor = allAuditors.find(a => String(a.id) === String(peerAuditorId));
                  const peerEval = peerAuditorId ? inst.evaluations?.[String(peerAuditorId)] : null;
                  
                  const isMyEvalFinal = myEval.isComplete;

                  return (
                    <div key={inst.id} className={`p-6 bg-white border-2 rounded-3xl transition-all ${activeInstrumentId === inst.id ? 'border-indigo-400 shadow-xl' : 'border-slate-200'}`}>
                        <div onClick={() => setActiveInstrumentId(inst.id === activeInstrumentId ? null : inst.id)} className="flex justify-between items-start gap-4 cursor-pointer">
                            <p className="font-bold text-slate-800 flex-1 pr-8 leading-relaxed">{inst.pertanyaan}</p>
                        </div>

                        {activeInstrumentId === inst.id && (
                            <div className="mt-6 pt-6 border-t border-slate-200 animate-in fade-in duration-300 space-y-6">
                                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-wider mb-2 flex items-center gap-2"><PenLine size={12}/> Jawaban Auditee</h4>
                                        <p className="text-sm text-slate-800 font-medium leading-relaxed">{inst.jawaban_auditee || <span className="italic text-slate-400">Belum ada jawaban.</span>}</p>
                                    </div>
                                    <div>
                                        <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-wider mb-2 flex items-center gap-2"><LinkIcon size={12}/> Bukti Dokumen</h4>
                                        {inst.doc_file ? <a href={inst.doc_file} target="_blank" rel="noreferrer" className="text-xs font-bold text-indigo-600 flex items-center gap-2 underline hover:text-indigo-800 transition-colors break-all p-2 bg-indigo-50 rounded-lg border border-indigo-100"><LinkIcon size={14} className="shrink-0"/> {inst.doc_file}</a> : <span className="text-xs italic text-slate-400">Belum ada bukti yang diunggah.</span>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-white p-4 rounded-2xl border-2 border-indigo-200 shadow-lg relative overflow-hidden">
                                        <h4 className="font-bold text-xs uppercase text-indigo-600 mb-3">Evaluasi Anda</h4>
                                        <textarea className="w-full p-3 border rounded-lg text-sm h-24 mb-2" placeholder="Catatan Internal Auditor..." value={myEval.catatan_desk || ''} onChange={(e) => handleEvaluationChange(inst.id, 'catatan_desk', e.target.value)} disabled={isMyEvalFinal}/>
                                        
                                        <div className="flex gap-2 items-center">
                                          <div className="relative flex-1">
                                            <select className="w-full p-2.5 pl-3 border rounded-lg text-sm font-bold bg-white appearance-none" value={myEval.skor_desk ?? ''} onChange={(e) => handleEvaluationChange(inst.id, 'skor_desk', e.target.value === '' ? undefined : parseInt(e.target.value))} disabled={isMyEvalFinal}>
                                                  <option value="">Beri Skor (0-4)</option>
                                                  <option value="4">4 - Sangat Sesuai</option>
                                                  <option value="3">3 - Sesuai (Minor)</option>
                                                  <option value="2">2 - Kurang Sesuai</option>
                                                  <option value="1">1 - Tidak Sesuai</option>
                                                  <option value="0">0 - Tidak Ada Bukti</option>
                                            </select>
                                            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"/>
                                          </div>
                                          <button onClick={() => handleEvaluationChange(inst.id, 'status', DocumentStatus.APPROVED)} className={`p-2.5 rounded-lg text-xs font-bold flex-1 transition-all ${myEval.status === DocumentStatus.APPROVED ? 'bg-emerald-600 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`} disabled={isMyEvalFinal}>
                                            <CheckCircle2 size={14} className="inline mr-1 mb-0.5"/> Valid
                                          </button>
                                          <button onClick={() => {
                                              if (myEval.status === DocumentStatus.REJECTED) {
                                                  // Jika sudah mode revisi, tombol ini toggle input
                                                  // Tapi kita biarkan saja agar user bisa edit pesan
                                              } else {
                                                  handleEvaluationChange(inst.id, 'status', DocumentStatus.REJECTED);
                                              }
                                          }} className={`p-2.5 rounded-lg text-xs font-bold flex-1 transition-all ${myEval.status === DocumentStatus.REJECTED ? 'bg-amber-500 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`} disabled={isMyEvalFinal}>
                                            <MessageSquare size={14} className="inline mr-1 mb-0.5"/> Diskusi
                                          </button>
                                        </div>

                                        {myEval.status === DocumentStatus.REJECTED && (
                                            <div className="mt-3 p-3 bg-amber-50 rounded-xl border border-amber-100 animate-in slide-in-from-top-2">
                                                <label className="text-[10px] font-black uppercase text-amber-700 mb-1 block">Pesan untuk Auditee (Revisi)</label>
                                                <div className="flex gap-2">
                                                    <input type="text" value={myEval.doc_note || ''} onChange={(e) => handleEvaluationChange(inst.id, 'doc_note', e.target.value)} placeholder="Tulis permintaan perbaikan..." className="flex-1 p-2 border border-amber-200 rounded-lg text-xs focus:ring-2 focus:ring-amber-400 outline-none" disabled={isMyEvalFinal}/>
                                                    <button className="p-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"><Send size={14}/></button>
                                                </div>
                                            </div>
                                        )}

                                        {!isMyEvalFinal && (
                                            <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100">
                                                <button onClick={() => handleSaveDraft(inst.id)} className="flex-1 px-3 py-2 text-xs font-bold bg-slate-50 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">Simpan Draf</button>
                                                <button onClick={() => handleFinalizeEvaluation(inst.id)} className="flex-1 px-3 py-2 text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg shadow-md transition-all">Finalisasi</button>
                                            </div>
                                        )}
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                                        <h4 className="font-bold text-xs uppercase text-teal-600 mb-3">Evaluasi {peerAuditor.nama.split(',')[0]}</h4>
                                        {peerEval.isComplete ? (
                                            <>
                                                <p className="text-xs p-3 bg-white rounded-lg h-24 overflow-y-auto border">{peerEval.catatan_desk || <span className="italic text-slate-400">Tidak ada catatan.</span>}</p>
                                                <div className="mt-2 text-center text-xs font-bold p-2 bg-white rounded-lg border flex justify-between items-center"><span>Status: {peerEval.status}</span><span className="text-2xl font-black">{peerEval.skor_desk ?? '-'}</span></div>
                                            </>
                                        ) : <div className="text-center pt-10 text-xs italic text-slate-400">Menunggu penilaian dari rekan auditor.</div> }
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                  )
              })}
            </>
           )}
        </div>
      )}
    </div>
  );
};

export default DeskEvaluationView;
