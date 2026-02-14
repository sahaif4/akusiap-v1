import React, { useState, useEffect, useMemo } from 'react';
import { 
  Building2, FileCheck2, Loader2, AlertTriangle, Send, FileSignature, Edit, ShieldCheck, CheckCircle2, XCircle, 
  History, Download, Printer, CornerUpLeft, Lock, MessageSquare, PenSquare, FileSpreadsheet
} from 'lucide-react';
import { 
  CurrentUser, Role, Unit, AuditCycle, AuditCycleStatus, AdminDocStatus, AuditDocument, HistoryLogEntry,
  FindingType, Instrument
} from '../types';
import { generateAuditSummary } from '../services/geminiService';

const STORAGE_KEYS = {
  UNITS: 'siapepi_master_units',
  USERS: 'siapepi_master_users',
  CYCLES: 'siapepi_audit_cycles',
  DOCUMENTS: 'siapepi_admin_docs_v1',
  INSTRUMENTS: 'siapepi_active_instruments_v2_dual',
  FINDINGS: 'siapepi_findings_v2',
};

const KRITERIA_MAP: Record<string, string> = { "STD-01": "K1", "STD-02": "K2", "STD-03": "K3", "STD-04": "K4", "STD-05": "K5", "STD-06": "K6", "STD-07": "K7", "STD-08": "K8", "STD-09": "K9" };


const AdminWorkflowView: React.FC<{ currentUser: CurrentUser | null }> = ({ currentUser }) => {
  const [selectedUnitName, setSelectedUnitName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [revisionModalOpen, setRevisionModalOpen] = useState(false);
  const [justification, setJustification] = useState('');

  // --- Data Loading ---
  const [units, setUnits] = useState<Unit[]>(() => JSON.parse(localStorage.getItem(STORAGE_KEYS.UNITS) || '[]'));
  const [users, setUsers] = useState<any[]>(() => JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]'));
  const [auditCycles, setAuditCycles] = useState<Record<string, AuditCycle>>(() => JSON.parse(localStorage.getItem(STORAGE_KEYS.CYCLES) || '{}'));
  const [documents, setDocuments] = useState<AuditDocument[]>(() => JSON.parse(localStorage.getItem(STORAGE_KEYS.DOCUMENTS) || '[]'));

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(documents));
  }, [documents]);

  const auditUnits = useMemo(() => units.filter(u => auditCycles[u.nama_unit]), [units, auditCycles]);
  const activeDocument = useMemo(() => documents.find(d => d.unitName === selectedUnitName), [documents, selectedUnitName]);
  const activeCycle = useMemo(() => selectedUnitName ? auditCycles[selectedUnitName] : null, [auditCycles, selectedUnitName]);
  
  // --- Role Checks ---
  const isAuditor = currentUser?.role === Role.AUDITOR || currentUser?.role === Role.SUPER_ADMIN;
  const isAuditee = [Role.ADMIN_PRODI, Role.KAPRODI, Role.AUDITEE].includes(currentUser?.role as Role);
  const isManagement = [Role.ADMIN_UPM, Role.SUPER_ADMIN, Role.PIMPINAN, Role.WADIR].includes(currentUser?.role as Role);

  // --- Document Generation ---
  const handleGenerateDocument = async () => {
    if (!selectedUnitName) return;
    setIsLoading(true);

    // --- Data Aggregation ---
    const allInstruments: Instrument[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.INSTRUMENTS) || '[]');
    const allFindings: any[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.FINDINGS) || '[]');
    
    const instruments = allInstruments.filter(i => i.unit_target === selectedUnitName);
    const findings = allFindings.filter(f => f.unit === selectedUnitName);
    
    const [auditor1, auditor2] = users.filter(u => u.role === Role.AUDITOR).slice(0, 2) || [{nama: 'Auditor 1'}, {nama: 'Auditor 2'}];
    const kaprodi = users.find(u => u.unitName === selectedUnitName && u.role === Role.KAPRODI) || users.find(u => u.unitName === selectedUnitName) || { nama: 'Ketua Unit' };

    const scoresByStandard: Record<string, number[]> = {};
    instruments.forEach(inst => {
      if (!scoresByStandard[inst.standard]) scoresByStandard[inst.standard] = [];
      if(inst.auditor_ids && inst.evaluations) {
        const [id1, id2] = inst.auditor_ids;
        // FIX: Use string index for evaluations object
        const score1 = inst.evaluations[String(id1)]?.skor_desk ?? 0;
        const score2 = inst.evaluations[String(id2)]?.skor_desk ?? 0;
        scoresByStandard[inst.standard].push((score1 + score2) / 2);
      }
    });

    const scoreSummary = Object.entries(scoresByStandard).map(([std, scores]) => ({ kriteria: KRITERIA_MAP[std] || std, score: (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2) }));
    
    const overallScore = activeCycle?.finalScore || 0;
    const predicate = overallScore >= 3.5 ? 'Melampaui Standar' : 'Memenuhi Standar';
    const majorFindings = findings.filter(f => f.tipe === FindingType.MAJOR).length;
    
    const aiSummary = await generateAuditSummary(findings.length, majorFindings, selectedUnitName);

    const newDocContent = {
      unitName: selectedUnitName,
      overallScore: overallScore.toFixed(2),
      predicate,
      scoreSummary,
      majorFindings,
      minorFindings: findings.filter(f => f.tipe === FindingType.MINOR).length,
      obsFindings: findings.filter(f => f.tipe === FindingType.OBS).length,
      topFindingsSummary: findings.slice(0, 3).map(f => `• ${f.uraian}`).join('\n'),
      aiSummary,
      auditor1Name: auditor1.nama,
      auditor2Name: auditor2.nama,
      kaprodiName: kaprodi.nama,
    };

    const newDoc: AuditDocument = {
      id: Date.now(),
      unitName: selectedUnitName,
      documentType: 'Berita Acara AMI',
      auditCycleYear: '2024/2025',
      status: AdminDocStatus.DRAFT,
      content: newDocContent,
      revisionCount: 0,
      revisionHistory: [],
      auditorSignature: null,
      auditor2Signature: null,
      auditeeSignature: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      historyLog: [{ id: Date.now(), user: currentUser!.name, action: 'Membuat dokumen Berita Acara', timestamp: new Date().toLocaleString('id-ID') }],
    };

    setDocuments(prev => [...prev.filter(d => d.unitName !== selectedUnitName), newDoc]);
    setIsLoading(false);
  };

  const handleExport = (format: 'pdf' | 'excel') => {
    if (!selectedUnitName) return;
    const alertMessage = format === 'pdf'
      ? `Memulai unduhan Laporan Audit Lapangan Lengkap (PDF) untuk ${selectedUnitName}.`
      : `Memulai unduhan Laporan Analitis Lengkap (Excel) untuk ${selectedUnitName}.`;
    alert(alertMessage);
  };
  
  // --- Workflow Actions ---
  const updateDocument = (id: number, updates: Partial<AuditDocument>, logAction: string) => {
    setDocuments(prev => prev.map(doc => {
      if (doc.id === id) {
        const newLog: HistoryLogEntry = { id: Date.now(), user: currentUser!.name, action: logAction, timestamp: new Date().toLocaleString('id-ID') };
        return { ...doc, ...updates, updatedAt: new Date().toISOString(), historyLog: [newLog, ...doc.historyLog] };
      }
      return doc;
    }));
  };

  const handleSendToAuditee = () => {
    if (activeDocument) updateDocument(activeDocument.id, { status: AdminDocStatus.SENT_TO_AUDITEE }, 'Mengirim dokumen ke Auditee');
  };

  const handleAgreeAndSign = () => {
    if (activeDocument && window.confirm('Apakah Anda yakin menyetujui isi dokumen ini dan membubuhkan tanda tangan digital?')) {
      const signature = { userId: currentUser!.id, userName: currentUser!.name, role: currentUser!.role, timestamp: new Date().toISOString() };
      updateDocument(activeDocument.id, { status: AdminDocStatus.AGREED_BY_AUDITEE, auditeeSignature: signature }, 'Menyetujui dan menandatangani dokumen');
    }
  };

  const handleRequestRevision = () => {
    if (!justification.trim()) return alert('Justifikasi revisi tidak boleh kosong.');
    if (activeDocument) {
      const newRevisionEntry = { version: activeDocument.revisionCount + 1, justification, requestedBy: currentUser!.name, timestamp: new Date().toISOString() };
      updateDocument(activeDocument.id, { 
        status: AdminDocStatus.REVISION_REQUESTED, 
        revisionCount: activeDocument.revisionCount + 1,
        revisionHistory: [newRevisionEntry, ...activeDocument.revisionHistory]
      }, `Meminta revisi (ke-${activeDocument.revisionCount + 1})`);
      setRevisionModalOpen(false);
      setJustification('');
    }
  };

  const handleAuditorSign = () => {
      if (!activeDocument) return;
      if (window.confirm('Tindakan ini akan membubuhkan tanda tangan Anda. Dokumen akan final setelah semua auditor menandatangani. Lanjutkan?')) {
          const signature = { userId: currentUser!.id, userName: currentUser!.name, role: currentUser!.role, timestamp: new Date().toISOString() };
          
          let updates: Partial<AuditDocument> = {};
          if (!activeDocument.auditorSignature) {
              updates.auditorSignature = signature;
          } else if (!activeDocument.auditor2Signature) {
              updates.auditor2Signature = signature;
          }

          if (activeDocument.auditorSignature && activeDocument.auditor2Signature) {
              updates.status = AdminDocStatus.FINALIZED;
          }

          updateDocument(activeDocument.id, updates, 'Menandatangani dokumen');

          if( (activeDocument.auditorSignature || updates.auditorSignature) && (activeDocument.auditor2Signature || updates.auditor2Signature) ) {
            updateDocument(activeDocument.id, { status: AdminDocStatus.FINALIZED }, 'Memfinalisasi dokumen');
          }
      }
  };


  const renderStatusBadge = (status: AdminDocStatus) => {
    const styles: Record<AdminDocStatus, string> = {
      [AdminDocStatus.DRAFT]: 'bg-slate-100 text-slate-600',
      [AdminDocStatus.SENT_TO_AUDITEE]: 'bg-blue-100 text-blue-700',
      [AdminDocStatus.REVISION_REQUESTED]: 'bg-amber-100 text-amber-800',
      [AdminDocStatus.AGREED_BY_AUDITEE]: 'bg-teal-100 text-teal-700',
      [AdminDocStatus.FINALIZED]: 'bg-emerald-100 text-emerald-700',
    };
    return <span className={`px-3 py-1 text-[10px] font-black rounded-full border ${styles[status].replace('bg-','border-')}`}>{status}</span>;
  };

  const renderContent = () => {
    if (!selectedUnitName) return <div className="text-center py-20 text-slate-400">Pilih unit kerja untuk memulai.</div>;
    if (isLoading) return <div className="text-center py-20 text-indigo-500"><Loader2 className="animate-spin inline-block mr-2"/>Membuat draf dokumen...</div>;
    if (!activeDocument) {
      if (isAuditor) {
        const isCycleFinal = activeCycle?.status === AuditCycleStatus.FINALIZED;
        return (
          <div className="text-center py-20">
            <h3 className="font-bold text-slate-800">Belum Ada Dokumen</h3>
            <p className="text-sm text-slate-500 mb-6">Proses audit lapangan untuk unit ini harus difinalisasi terlebih dahulu.</p>
            <button onClick={handleGenerateDocument} disabled={!isCycleFinal} className="px-6 py-3 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
              {isCycleFinal ? 'Generate Berita Acara' : 'Audit Lapangan Belum Final'}
            </button>
          </div>
        );
      }
      return <div className="text-center py-20 text-slate-400">Belum ada dokumen administrasi yang dibuat untuk unit ini.</div>;
    }
    
    const canAuditeeRevise = activeDocument.revisionCount < 2;
    const isVisibleToManagement = activeDocument.status === AdminDocStatus.FINALIZED;
    const allAuditorsSigned = activeDocument.auditorSignature && activeDocument.auditor2Signature;

    if (isManagement && !isVisibleToManagement) {
      return <div className="text-center py-20 text-slate-400">Dokumen sedang dalam proses dan belum dapat dilihat. Dokumen akan tampil setelah final.</div>;
    }

    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2">
           <div className="bg-white p-12 shadow-lg rounded-lg border font-serif print:shadow-none print:p-0 print:border-none">
             <div className="text-center border-b-[3px] border-black pb-4 mb-4"><h3 className="text-lg font-bold uppercase underline">Berita Acara Audit Mutu Internal (AMI)</h3><p className="text-xs font-bold">Siklus {activeDocument.auditCycleYear}</p></div>
             <p className="text-xs">Unit: <span className="font-bold">{activeDocument.unitName}</span></p>
             <h4 className="font-bold text-sm border-b mt-4 pb-1">C. Hasil Audit</h4>
             <div className="grid grid-cols-2 gap-4 text-xs mt-2">
               <table className="w-full border-collapse border"><thead className="bg-slate-100"><tr><th className="border p-1">Kriteria</th><th className="border p-1">Skor</th></tr></thead><tbody>{activeDocument.content.scoreSummary.map((s:any) => <tr key={s.kriteria}><td className="border p-1 font-bold">{s.kriteria}</td><td className="border p-1 font-black text-center">{s.score}</td></tr>)}</tbody><tfoot className="font-bold bg-slate-100"><tr><td className="border p-1">Rata-rata</td><td className="border p-1 text-center">{activeDocument.content.overallScore}</td></tr></tfoot></table>
               <div><p className="font-bold text-[10px] uppercase">Temuan:</p><p>{activeDocument.content.majorFindings} Major, {activeDocument.content.minorFindings} Minor, {activeDocument.content.obsFindings} OBS</p><p className="font-bold text-[10px] uppercase mt-2">Kesimpulan AI:</p><p className="italic text-slate-600">{activeDocument.content.aiSummary}</p></div>
             </div>
             <div className="grid grid-cols-3 gap-10 pt-10 text-center text-[10px] mt-4">
                <div><p>Auditor 1</p><div className="h-16 flex items-center justify-center">{activeDocument.auditorSignature ? <ShieldCheck className="text-emerald-500" size={32} /> : <div className="w-24 h-8 bg-slate-100 rounded"/>}</div><p className="font-bold underline uppercase">{activeDocument.content.auditor1Name}</p></div>
                <div><p>Auditor 2</p><div className="h-16 flex items-center justify-center">{activeDocument.auditor2Signature ? <ShieldCheck className="text-emerald-500" size={32} /> : <div className="w-24 h-8 bg-slate-100 rounded"/>}</div><p className="font-bold underline uppercase">{activeDocument.content.auditor2Name}</p></div>
                <div><p>Perwakilan Unit (Auditee)</p><div className="h-16 flex items-center justify-center">{activeDocument.auditeeSignature ? <ShieldCheck className="text-emerald-500" size={32} /> : <div className="w-24 h-8 bg-slate-100 rounded"/>}</div><p className="font-bold underline uppercase">{activeDocument.content.kaprodiName}</p></div>
             </div>
           </div>
        </div>
        <div className="space-y-6 sticky top-4">
          <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-4">
            <div className="flex justify-between items-center"><h4 className="font-bold text-sm">Status Dokumen</h4>{renderStatusBadge(activeDocument.status)}</div>
            {isAuditor && activeDocument.status === AdminDocStatus.DRAFT && <button onClick={handleSendToAuditee} className="w-full btn-primary flex items-center justify-center gap-2"><Send size={16}/> Kirim ke Auditee</button>}
            {isAuditor && activeDocument.status === AdminDocStatus.REVISION_REQUESTED && <button onClick={handleSendToAuditee} className="w-full btn-primary flex items-center justify-center gap-2"><Send size={16}/> Kirim Ulang Revisi</button>}
            {isAuditor && activeDocument.status === AdminDocStatus.AGREED_BY_AUDITEE && !allAuditorsSigned && <button onClick={handleAuditorSign} className="w-full btn-primary flex items-center justify-center gap-2"><FileSignature size={16}/> Tanda Tangan & Finalisasi</button>}
            {isAuditee && activeDocument.status === AdminDocStatus.SENT_TO_AUDITEE && (<div className="flex gap-2"><button onClick={() => setRevisionModalOpen(true)} disabled={!canAuditeeRevise} className="w-full btn-secondary flex items-center justify-center gap-2 disabled:opacity-50"><Edit size={16}/> Minta Revisi ({activeDocument.revisionCount}/2)</button><button onClick={handleAgreeAndSign} className="w-full btn-primary flex items-center justify-center gap-2"><CheckCircle2 size={16}/> Setuju</button></div>)}
            {!canAuditeeRevise && isAuditee && activeDocument.status === AdminDocStatus.SENT_TO_AUDITEE && <p className="text-xs text-rose-600 font-bold">Batas revisi telah habis. Anda harus menyetujui dokumen ini.</p>}
            {activeDocument.status === AdminDocStatus.FINALIZED && (<div className="space-y-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase text-center">Berita Acara</p>
                <div className="flex gap-2"><button className="w-full btn-secondary flex items-center justify-center gap-2"><Printer size={16}/> Cetak BA</button><button className="w-full btn-secondary flex items-center justify-center gap-2"><Download size={16}/> Unduh BA</button></div>
                <p className="text-[10px] font-bold text-slate-400 uppercase text-center pt-2 border-t">Laporan Lengkap</p>
                <div className="flex gap-2"><button onClick={() => handleExport('pdf')} className="w-full btn-secondary flex items-center justify-center gap-2"><Download size={16}/> Laporan PDF</button><button onClick={() => handleExport('excel')} className="w-full btn-secondary flex items-center justify-center gap-2"><FileSpreadsheet size={16}/> Laporan XLS</button></div>
              </div>)}
          </div>
          <div className="bg-white p-6 rounded-2xl border shadow-sm"><h4 className="font-bold text-sm mb-4 flex items-center gap-2"><History size={16}/> Riwayat Proses</h4><div className="space-y-3 max-h-60 overflow-y-auto">{activeDocument.historyLog.map(log => <div key={log.id} className="text-xs"><p className="font-bold">{log.action} <span className="font-normal text-slate-500">oleh {log.user}</span></p><p className="text-slate-400 text-[10px]">{log.timestamp}</p></div>)}</div></div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div><h2 className="text-2xl font-black">Administrasi AMI</h2><p className="text-sm text-slate-500">Alur Kerja Dokumen & Tanda Tangan Digital</p></div>
      </div>
      <div className="flex gap-8">
        <div className="w-64 bg-white border rounded-2xl p-4">
          <h3 className="font-bold text-xs uppercase text-slate-400 px-2 mb-2">Unit Audit</h3>
          {auditUnits.map(u => (<button key={u.id} onClick={() => setSelectedUnitName(u.nama_unit)} className={`w-full text-left p-3 rounded-lg text-sm font-bold ${selectedUnitName === u.nama_unit ? 'bg-indigo-600 text-white' : 'hover:bg-slate-50'}`}>{u.nama_unit}</button>))}
        </div>
        <div className="flex-1">{renderContent()}</div>
      </div>

      {revisionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg">
            <h3 className="font-bold">Permintaan Revisi</h3><p className="text-xs text-slate-500 mb-4">Berikan justifikasi yang jelas untuk auditor.</p>
            <textarea value={justification} onChange={e => setJustification(e.target.value)} className="w-full border rounded-lg p-2 h-32 text-sm" />
            <div className="flex gap-2 mt-4"><button onClick={() => setRevisionModalOpen(false)} className="btn-secondary flex-1">Batal</button><button onClick={handleRequestRevision} className="btn-primary flex-1">Kirim Permintaan</button></div>
          </div>
        </div>
      )}

      <style>{`.btn-primary { padding: 8px 12px; background-color: #4f46e5; color: white; border-radius: 8px; font-size: 12px; font-weight: bold; } .btn-secondary { padding: 8px 12px; background-color: #f1f5f9; color: #475569; border-radius: 8px; font-size: 12px; font-weight: bold; }`}</style>
    </div>
  );
};

export default AdminWorkflowView;