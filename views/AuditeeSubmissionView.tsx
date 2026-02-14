
import React, { useState, useEffect, useMemo } from 'react';
import { 
  UploadCloud, ShieldCheck, FileText, ClipboardList, AlertCircle, Trash2, RefreshCw, 
  CheckCircle2, AlertTriangle, PenLine, Save, Loader2, ServerCrash, Send, Lock, HelpCircle,
  Clock, Check, MessageSquareText, GanttChart, Link as LinkIcon
} from 'lucide-react';
import { DocumentStatus, Instrument, UnitSubmissionStatus } from '../types';
import * as apiService from '../services/apiService';

interface AuditeeSubmissionViewProps {
  userUnit?: string;
}

const AuditeeSubmissionView: React.FC<AuditeeSubmissionViewProps> = ({ userUnit }) => {
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [submissionStatus, setSubmissionStatus] = useState<UnitSubmissionStatus>(UnitSubmissionStatus.DRAFT);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadingId, setUploadingId] = useState<number | null>(null);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (userUnit) {
        setIsLoading(true);
        setError(null);
        try {
          console.log("Fetching instruments for:", userUnit);
          const [data, status] = await Promise.all([
            apiService.getDeskEvaluationInstruments(userUnit),
            apiService.getSubmissionStatus(userUnit),
          ]);
          console.log("Instruments received:", data);
          setInstruments(data);
          setSubmissionStatus(status);
        } catch (error: any) {
          setError(error.message || "Gagal memuat data. Pastikan backend berjalan.");
        } finally {
          setIsLoading(false);
        }
      }
    };
    loadData();
  }, [userUnit]);

  const isAllCompleted = useMemo(() => {
    if (instruments.length === 0) return false;
    return instruments.every(i => i.doc_file && i.jawaban_auditee?.trim());
  }, [instruments]);
  
  // Auto-update status from DRAFT to READY_TO_SUBMIT
  useEffect(() => {
    if (isAllCompleted && submissionStatus === UnitSubmissionStatus.DRAFT) {
      setSubmissionStatus(UnitSubmissionStatus.READY_TO_SUBMIT);
    } else if (!isAllCompleted && submissionStatus === UnitSubmissionStatus.READY_TO_SUBMIT) {
      setSubmissionStatus(UnitSubmissionStatus.DRAFT);
    }
  }, [isAllCompleted, submissionStatus]);

  const completedCount = instruments.filter(i => i.doc_file && i.jawaban_auditee?.trim()).length;
  const totalCount = instruments.length;
  const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  
  const isLocked = submissionStatus === UnitSubmissionStatus.SUBMITTED || submissionStatus === UnitSubmissionStatus.ACCEPTED;

  const handleLinkSave = async (id: number, link: string) => {
    if (isLocked) return;
    if (!link.trim()) return;
    
    setUploadingId(id);
    try {
      // Simpan sebagai 'uploaded_file' di backend (karena backend mengharapkan field ini untuk dokumen)
      await apiService.submitAuditResponse({ instrument_id: id, unit_name: userUnit!, uploaded_file: link });
      setInstruments(prev => prev.map(inst => 
        inst.id === id ? { ...inst, doc_status: DocumentStatus.UPLOADED, doc_file: link, doc_note: undefined } : inst
      ));
    } catch (error) {
        alert("Gagal menyimpan link dokumen.");
    } finally {
        setUploadingId(null);
    }
  };
  
  const handleSaveTextAnswer = async (id: number, isDraftSave: boolean = false) => {
    if (isLocked) return;
    const instrument = instruments.find(i => i.id === id);
    if (!instrument || !userUnit) return;
    
    setSavingId(id);
    try {
      await apiService.submitAuditResponse({ instrument_id: id, unit_name: userUnit, answer_text: instrument.jawaban_auditee });
      if (isDraftSave) alert('Perubahan berhasil disimpan sebagai draf.');
    } catch (error) {
        alert("Gagal menyimpan jawaban.");
    } finally {
        setSavingId(null);
    }
  };

  const handleConfirmSubmit = async () => {
    if (!userUnit) return;
    setIsConfirmModalOpen(false);
    try {
        await apiService.setSubmissionStatus(userUnit, UnitSubmissionStatus.SUBMITTED);
        setSubmissionStatus(UnitSubmissionStatus.SUBMITTED);
        alert('Dokumen berhasil dikirim ke Auditor. Halaman akan dikunci.');
    } catch (error) {
        alert('Gagal mengirim dokumen.');
    }
  };
  
  const handleTextChange = (id: number, text: string) => {
    if (isLocked) return;
    setInstruments(prev => prev.map(inst => inst.id === id ? { ...inst, jawaban_auditee: text } : inst));
  };
  
  const getStatusChip = (status: UnitSubmissionStatus) => {
    switch(status) {
      case UnitSubmissionStatus.DRAFT: return { text: 'Draft', color: 'bg-slate-100 text-slate-600 border-slate-200' };
      case UnitSubmissionStatus.READY_TO_SUBMIT: return { text: 'Siap Kirim', color: 'bg-blue-100 text-blue-700 border-blue-200' };
      case UnitSubmissionStatus.SUBMITTED: return { text: 'Terkirim', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' };
      case UnitSubmissionStatus.RETURNED: return { text: 'Dikembalikan', color: 'bg-amber-100 text-amber-700 border-amber-200' };
      case UnitSubmissionStatus.ACCEPTED: return { text: 'Final', color: 'bg-indigo-100 text-indigo-700 border-indigo-200' };
      default: return { text: 'Unknown', color: '' };
    }
  };

  const { text: statusText, color: statusColor } = getStatusChip(submissionStatus);
  
  if (isLoading) return <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin text-indigo-500" size={32}/></div>;

  if (error) return (
    <div className="flex flex-col items-center justify-center h-full min-h-[40vh] bg-rose-50 border border-rose-200 rounded-2xl p-8">
      <ServerCrash size={48} className="text-rose-400" />
      <h3 className="mt-4 text-lg font-bold text-rose-800">Gagal Memuat Data</h3>
      <p className="mt-1 text-sm text-rose-600 text-center max-w-sm">{error}</p>
      <button onClick={() => window.location.reload()} className="mt-6 px-4 py-2 bg-rose-600 text-white text-xs font-bold rounded-lg hover:bg-rose-700">Coba Lagi</button>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-28">
      <div className="bg-white border border-slate-200 p-8 rounded-[2.5rem] shadow-sm flex flex-col md:flex-row justify-between items-start gap-4">
         <div>
           <div className="flex items-center gap-3">
             <h2 className="text-2xl font-black text-slate-900 tracking-tight">Pengumpulan Bukti Audit</h2>
             <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${statusColor}`}>{statusText}</span>
           </div>
           <p className="text-sm text-slate-500 font-medium">Lengkapi jawaban dan unggah file bukti untuk setiap instrumen.</p>
         </div>
         <div className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest border flex items-center gap-2 transition-all ${isAllCompleted ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>
           <ShieldCheck size={16} /> {completedCount} / {totalCount} Lengkap ({progressPercentage}%)
         </div>
      </div>

      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
         <div className={`h-full transition-all duration-1000 ${isAllCompleted ? 'bg-emerald-500' : 'bg-indigo-500'}`} style={{ width: `${progressPercentage}%` }}></div>
      </div>

      <div className="space-y-6">
        {instruments.length === 0 ? (
          <div className="text-center py-20 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl"><ClipboardList size={40} className="mx-auto text-slate-300 mb-4" /> <h3 className="font-bold">Menunggu Instrumen dari Auditor</h3></div>
        ) : instruments.map((item) => {
          const isRejected = submissionStatus === UnitSubmissionStatus.RETURNED && item.doc_status === DocumentStatus.REJECTED;
          return (
            <div key={item.id} className={`p-8 bg-white border rounded-[2.5rem] flex flex-col md:flex-row gap-8 items-start transition-all group relative overflow-hidden ${isRejected ? 'border-rose-300' : 'border-slate-200'} ${isLocked ? 'bg-slate-50/50' : ''}`}>
               {isLocked && <div className="absolute inset-0 z-10"/>}
               {isRejected && <div className="absolute top-0 left-0 w-1.5 h-full bg-rose-500"></div>}
               <div className="flex-1 space-y-4 w-full">
                  <div className="flex items-center gap-2"><span className="px-2 py-1 bg-slate-900 text-white text-[10px] font-black rounded-lg uppercase">{item.standard}</span></div>
                  <h4 className="font-bold text-slate-800 text-lg leading-snug">{item.pertanyaan}</h4>
                  <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100 text-[10px] font-bold text-slate-500 italic"><FileText size={14} className="text-indigo-400" /> SYARAT BUKTI: {item.bukti_wajib || 'Dokumen Terkait'}</div>
                  <div className="mt-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block"><PenLine size={12} className="inline mr-1"/> Jawaban / Penjelasan Anda:</label>
                    <div className="relative">
                      <textarea className={`w-full p-4 rounded-2xl text-sm font-medium outline-none transition-all resize-none shadow-sm ${isLocked ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : 'bg-white border border-slate-200 focus:ring-2 focus:ring-indigo-500'}`} rows={3} placeholder={isLocked ? "Jawaban dikunci." : "Tuliskan penjelasan..."} value={item.jawaban_auditee || ''} onChange={(e) => handleTextChange(item.id, e.target.value)} onBlur={() => handleSaveTextAnswer(item.id)} disabled={isLocked} />
                    </div>
                  </div>
                  {isRejected && (<div className="mt-4 p-4 bg-rose-50 border border-rose-200 rounded-2xl"><div className="flex items-start gap-3"><AlertTriangle className="text-rose-600 shrink-0 mt-0.5" size={18} /><div><p className="text-[10px] font-black text-rose-600 uppercase">PERLU PERBAIKAN:</p><p className="text-sm font-bold text-rose-900">"{item.doc_note || 'Mohon periksa kembali.'}"</p></div></div></div>)}
               </div>
               <div className="w-full md:w-72 flex-shrink-0">
                <div className={`p-6 rounded-[2rem] h-full flex flex-col justify-center transition-all ${isLocked ? 'bg-slate-100 border border-slate-200' : isRejected ? 'bg-rose-50 border border-rose-200' : 'bg-slate-50 border border-slate-200'}`}>
                    <label className="text-[10px] font-black uppercase tracking-widest mb-2 flex items-center gap-2 text-slate-400">
                        <LinkIcon size={12}/> Link Bukti Dokumen
                    </label>
                    <div className="relative">
                        <input 
                            type="text" 
                            className={`w-full p-3 pr-10 rounded-xl text-xs font-bold border outline-none transition-all ${isLocked ? 'bg-slate-200 text-slate-500 cursor-not-allowed' : 'bg-white focus:ring-2 focus:ring-indigo-500'}`}
                            placeholder="https://..."
                            defaultValue={item.doc_file || ''}
                            onBlur={(e) => handleLinkSave(item.id, e.target.value)}
                            disabled={isLocked}
                        />
                        {uploadingId === item.id ? (
                            <Loader2 size={16} className="absolute right-3 top-3 animate-spin text-indigo-500"/> 
                        ) : item.doc_file && (
                            <CheckCircle2 size={16} className="absolute right-3 top-3 text-emerald-500"/>
                        )}
                    </div>
                    {isRejected && <p className="text-[10px] font-bold text-rose-500 mt-2 text-center">Perbarui link bukti sesuai catatan auditor.</p>}
                </div>
               </div>
            </div>
          );
        })}
      </div>
      
      {/* --- SUBMISSION DOCK --- */}
      <div className="fixed bottom-0 left-0 w-full z-50 p-4">
        <div className="max-w-4xl mx-auto backdrop-blur-md rounded-3xl shadow-2xl border border-white/10 overflow-hidden">
          {submissionStatus === UnitSubmissionStatus.DRAFT || submissionStatus === UnitSubmissionStatus.READY_TO_SUBMIT ? (
            <div className="bg-slate-900/90 p-4 flex justify-between items-center">
              <div className="flex items-center gap-3 ml-3">
                {submissionStatus === UnitSubmissionStatus.READY_TO_SUBMIT ? <CheckCircle2 className="text-emerald-400"/> : <Clock className="text-blue-400"/>}
                <div>
                  <p className="text-white text-xs font-bold">
                    {submissionStatus === UnitSubmissionStatus.DRAFT && "Status: Draf (Belum Lengkap)"}
                    {submissionStatus === UnitSubmissionStatus.READY_TO_SUBMIT && "Status: Siap untuk Dikirim"}
                  </p>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                    Lengkapi semua isian
                  </p>
                </div>
              </div>
              <div className="relative group">
                <button 
                  onClick={() => setIsConfirmModalOpen(true)}
                  disabled={submissionStatus === UnitSubmissionStatus.DRAFT}
                  className="px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl transition-all flex items-center gap-2 bg-emerald-600 text-white hover:bg-emerald-700 disabled:bg-slate-600 disabled:text-slate-400 disabled:cursor-not-allowed"
                >
                  <Send size={14}/> Kirim ke Auditor
                </button>
                {submissionStatus === UnitSubmissionStatus.DRAFT && (
                  <div className="absolute bottom-full mb-3 right-0 w-64 p-3 bg-rose-600 text-white text-xs font-bold rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <HelpCircle className="inline-block mr-2"/> Lengkapi seluruh isian jawaban dan unggah semua file bukti untuk dapat mengirim.
                  </div>
                )}
              </div>
            </div>
          ) : submissionStatus === UnitSubmissionStatus.RETURNED ? (
             <div className="bg-amber-500/90 p-4 flex justify-between items-center">
                <div className="flex items-center gap-3 ml-3">
                    <AlertTriangle className="text-white"/>
                    <div>
                        <p className="text-white text-xs font-bold">Status: Dokumen Dikembalikan untuk Revisi</p>
                        <p className="text-amber-100 text-[10px] font-bold uppercase tracking-widest">Periksa catatan auditor dan unggah ulang</p>
                    </div>
                </div>
                <button onClick={() => setIsConfirmModalOpen(true)} className="px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl flex items-center gap-2 bg-white text-amber-700 hover:bg-amber-50">
                    <Send size={14}/> Kirim Ulang Revisi
                </button>
             </div>
          ) : ( // SUBMITTED or ACCEPTED
            <div className="bg-emerald-600/95 p-4 flex flex-col md:flex-row justify-between items-center gap-4">
               <div className="flex items-center gap-3 ml-3">
                  <CheckCircle2 size={24} className="text-white"/>
                  <div>
                     <p className="text-white text-sm font-bold">Berkas Telah Terkirim</p>
                     <p className="text-emerald-100 text-[10px] uppercase tracking-wider">Dokumen Anda sedang diverifikasi oleh auditor. Halaman ini bersifat 'read-only'.</p>
                  </div>
               </div>
               <div className="flex gap-3">
                  <button onClick={() => alert("Navigasi ke halaman diskusi...")} className="px-4 py-2 bg-white/10 text-white rounded-xl text-[10px] font-bold uppercase flex items-center gap-2 border border-white/20 hover:bg-white/20">
                     <MessageSquareText size={14}/> Buka Diskusi
                  </button>
                   <button onClick={() => alert("Navigasi ke halaman progres siklus...")} className="px-4 py-2 bg-white/10 text-white rounded-xl text-[10px] font-bold uppercase flex items-center gap-2 border border-white/20 hover:bg-white/20">
                     <GanttChart size={14}/> Lihat Progres
                  </button>
               </div>
            </div>
          )}
        </div>
      </div>
      
      {/* --- CONFIRMATION MODAL --- */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsConfirmModalOpen(false)} />
          <div className="relative bg-white w-full max-w-lg rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in-95 duration-200 text-center">
            <h3 className="text-2xl font-black text-slate-900" id="modal-title">Konfirmasi Pengiriman Audit</h3>
            <p className="text-slate-500 mt-4 max-w-sm mx-auto">
                Apakah Anda yakin ingin mengirim seluruh dokumen dan jawaban ke Auditor?
            </p>
            <ul className="text-left text-xs text-slate-500 space-y-2 bg-slate-50 p-4 rounded-xl border mt-6">
                <li>• Data <span className="font-bold">tidak dapat diubah</span> setelah dikirim.</li>
                <li>• Status akan berubah menjadi <span className="font-bold">"Menunggu Verifikasi Auditor"</span>.</li>
                <li>• Perubahan hanya dapat dilakukan jika Auditor <span className="font-bold">mengembalikan</span> dokumen untuk revisi.</li>
            </ul>
            <div className="flex gap-4 mt-8">
              <button onClick={() => setIsConfirmModalOpen(false)} className="flex-1 py-3 px-4 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50">Tidak, Kembali Edit</button>
              <button onClick={handleConfirmSubmit} className="flex-1 py-3 px-4 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg">Ya, Kirim ke Auditor</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default AuditeeSubmissionView;