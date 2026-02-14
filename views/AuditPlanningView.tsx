
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Target, BookOpen, Plus, Trash2, CheckCircle2, Building2, ListChecks, ArrowRight, Info, ClipboardList, Wand2, FileJson, Lock, ShieldAlert, Loader2, AlertTriangle, Edit, ChevronDown, Save, Square, CheckSquare, X
} from 'lucide-react';
import { DocumentStatus, Instrument, AuditCycleStatus, Unit, Standard } from '../types';
import * as apiService from '../services/apiService';

const MOCK_AUDITOR_IDS: [number, number] = [10, 12];

// --- Bank Data Modal Component ---
interface BankDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (items: { q: string, proof: string }[]) => void;
  bank: Record<string, any[]>;
  standardCode: string;
}

const BankDataModal: React.FC<BankDataModalProps> = ({ isOpen, onClose, onImport, bank, standardCode }) => {
  const questions = bank[standardCode] || [];
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);

  const handleToggle = (q: string) => {
    setSelectedQuestions(prev => prev.includes(q) ? prev.filter(item => item !== q) : [...prev, q]);
  };

  const handleImportClick = () => {
    const itemsToImport = questions.filter(q => selectedQuestions.includes(q.q));
    onImport(itemsToImport);
    onClose();
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-2xl space-y-4 max-h-[80vh] flex flex-col">
        <h3 className="font-bold">Pilih Instrumen dari Bank Data ({standardCode})</h3>
        <div className="flex-1 overflow-y-auto space-y-2 pr-2">
          {questions.map(q => (
            <label key={q.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100">
              <input type="checkbox" checked={selectedQuestions.includes(q.q)} onChange={() => handleToggle(q.q)} className="mt-1"/>
              <div>
                 <p className="text-sm font-bold">{q.q}</p>
                 <p className="text-xs text-slate-500 italic mt-1">Bukti: {q.proof}</p>
              </div>
            </label>
          ))}
        </div>
        <div className="flex justify-end gap-2 pt-4 border-t">
          <button onClick={onClose} className="px-4 py-2 bg-slate-100 rounded-lg text-sm">Batal</button>
          <button onClick={handleImportClick} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm">Impor ({selectedQuestions.length})</button>
        </div>
      </div>
    </div>
  );
};

// --- Manual Instrument Form Modal ---
interface InstrumentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { question: string, proof: string }) => void;
  initialData?: { question: string, proof: string };
  title: string;
}

const InstrumentFormModal: React.FC<InstrumentFormModalProps> = ({ isOpen, onClose, onSave, initialData, title }) => {
  const [q, setQ] = useState(initialData?.question || '');
  const [p, setP] = useState(initialData?.proof || '');

  // Reset state when modal opens/closes or initialData changes
  useEffect(() => {
    if (isOpen) {
        setQ(initialData?.question || '');
        setP(initialData?.proof || '');
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!q.trim()) return alert("Pertanyaan wajib diisi");
    onSave({ question: q, proof: p });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-lg space-y-4 shadow-2xl transform scale-100 transition-all">
        <h3 className="font-bold text-lg text-slate-800">{title}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Pertanyaan Audit</label>
                <textarea className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none" rows={4} value={q} onChange={e => setQ(e.target.value)} placeholder="Tulis pertanyaan audit secara lengkap..." required />
            </div>
            <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Bukti Dukung (Opsional)</label>
                <input type="text" className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none" value={p} onChange={e => setP(e.target.value)} placeholder="Contoh: SK Rektor, Absensi, Notulen Rapat..." />
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button type="button" onClick={onClose} className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-sm font-bold text-slate-600 transition-colors">Batal</button>
                <button type="submit" className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-200 transition-all transform active:scale-95">Simpan</button>
            </div>
        </form>
      </div>
    </div>
  );
};


// --- Main Audit Planning View ---
const AuditPlanningView: React.FC<{ onNavigate: (tab: string) => void }> = ({ onNavigate }) => {
  const [activeStep, setActiveStep] = useState(1);
  
  // Step 1 State
  const [auditCycles, setAuditCycles] = useState<any[]>([]);
  const [selectedCycle, setSelectedCycle] = useState('');
  const [selectedUnit, setSelectedUnit] = useState<string>('');
  const [standardType, setStandardType] = useState<'standar' | 'unggul'>('standar');

  // Step 2 State
  const [selectedStandards, setSelectedStandards] = useState<string[]>([]);
  
  // Step 3 State
  const [plannedInstruments, setPlannedInstruments] = useState<Partial<Instrument>[]>([]);
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);

  // Master Data State
  const [masterUnits, setMasterUnits] = useState<Unit[]>([]);
  const [masterStandards, setMasterStandards] = useState<Standard[]>([]);
  const [masterQuestionBank, setMasterQuestionBank] = useState<Record<string, any[]>>({});
  
  // Modal State
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [modalStandard, setModalStandard] = useState<string | null>(null);

  // Form Modal State (Manual Add / Edit)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingInstrument, setEditingInstrument] = useState<Partial<Instrument> | null>(null);
  const [targetStandardForManual, setTargetStandardForManual] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const loadMasterData = async () => {
      setIsLoading(true);
      try {
        const [units, standards, bank, cycles] = await Promise.all([
          apiService.getUnits(),
          apiService.getStandards(standardType),
          apiService.getInstrumentBank(standardType),
          apiService.getAuditCycles()
        ]);
        setMasterUnits(units.filter(u => u.jenis_unit === 'prodi'));
        setMasterStandards(standards);
        setMasterQuestionBank(bank);
        setAuditCycles(cycles);
        
        if (cycles.length > 0 && !selectedCycle) {
            const active = cycles.find((c: any) => c.status === 'Aktif') || cycles[0];
            setSelectedCycle(active.name);
        }

        setSelectedStandards([]);
        setPlannedInstruments([]);
        if (standards.length > 0) {
            setOpenAccordion(standards[0].kode_standar);
        }
      } catch (e) { console.error("Failed to load master data", e); } 
      finally { setIsLoading(false); }
    };
    loadMasterData();
  }, [standardType]);

  const openBankModal = (stdCode: string) => {
    setModalStandard(stdCode);
    setIsBankModalOpen(true);
  };
  
  const handleImportFromBank = (items: { q: string, proof: string }[]) => {
    if (!selectedUnit || !modalStandard) return;
    const newInstruments = items.map(item => ({
      id: Date.now() + Math.random(),
      unit_target: selectedUnit,
      standard: modalStandard,
      pertanyaan: item.q,
      bukti_wajib: item.proof,
    }));
    setPlannedInstruments(prev => [...prev, ...newInstruments]);
  };
  
  const openManualAdd = (stdCode: string) => {
    setEditingInstrument(null);
    setTargetStandardForManual(stdCode);
    setIsFormModalOpen(true);
  };

  const openEdit = (inst: Partial<Instrument>) => {
    setEditingInstrument(inst);
    setTargetStandardForManual(null);
    setIsFormModalOpen(true);
  };

  const handleSaveInstrumentForm = (data: { question: string, proof: string }) => {
    if (editingInstrument) {
        // Mode Edit
        setPlannedInstruments(prev => prev.map(inst => 
            inst.id === editingInstrument.id 
                ? { ...inst, pertanyaan: data.question, bukti_wajib: data.proof } 
                : inst
        ));
    } else if (targetStandardForManual && selectedUnit) {
        // Mode Add Manual
        const newInstrument: Partial<Instrument> = {
            id: Date.now() + Math.random(),
            unit_target: selectedUnit,
            standard: targetStandardForManual,
            pertanyaan: data.question,
            bukti_wajib: data.proof,
        };
        setPlannedInstruments(prev => [...prev, newInstrument]);
    }
    setIsFormModalOpen(false);
  };

  const handleRemoveInstrument = (id: number) => setPlannedInstruments(prev => prev.filter(inst => inst.id !== id));
  
  const handleSaveAndActivate = async () => {
    const confirmationMessage = `Anda akan mengunci perencanaan dan membuat ${plannedInstruments.length} instrumen untuk unit ${selectedUnit}. Tindakan ini akan mengirimkan notifikasi ke Auditee dan mengaktifkan tahap Desk Evaluation. Lanjutkan?`;
    if (plannedInstruments.length === 0) return alert("Belum ada instrumen yang ditambahkan.");
    if (!confirm(confirmationMessage)) return;

    setIsLoading(true);
    try {
        const instrumentsToSave = plannedInstruments.map(inst => ({ ...inst, id: undefined, auditor_ids: MOCK_AUDITOR_IDS, doc_status: DocumentStatus.MISSING }));
        await Promise.all(instrumentsToSave.map(inst => apiService.saveInstrument(inst)));
        
        // Call backend to activate planning
        await apiService.activateAuditPlanning(selectedUnit);

        alert("Perencanaan berhasil diaktifkan.");
        onNavigate('desk-eval');
    } catch (e: any) { 
        alert(`Gagal mengaktifkan perencanaan: ${e.message}`); 
        console.error(e); 
    } 
    finally { setIsLoading(false); }
  };

  const nextStep = () => setActiveStep(s => Math.min(s + 1, 3));
  const prevStep = () => setActiveStep(s => Math.max(s - 1, 1));
  
  const validationOk = useMemo(() => {
    if (activeStep === 1 && !selectedUnit) return false;
    if (activeStep === 2 && selectedStandards.length === 0) return false;
    if (activeStep === 3) {
      if (selectedStandards.length === 0) return false;
      return selectedStandards.every(std => plannedInstruments.some(inst => inst.standard === std));
    }
    return true;
  }, [activeStep, selectedUnit, selectedStandards, plannedInstruments]);

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="text-center"><h2 className="text-2xl font-black">Perencanaan Audit Mutu</h2><p className="text-sm text-slate-500">Alur kerja terpandu untuk penetapan instrumen.</p></div>
      <div className="flex items-center w-full max-w-2xl mx-auto my-12">
        {[{ s: 1, l: 'Lingkup' }, { s: 2, l: 'Standar' }, { s: 3, l: 'Instrumen' }].map((item, idx, arr) => (
          <React.Fragment key={item.s}>
            <div className="flex flex-col items-center z-10"><div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 font-bold text-xs ${activeStep >= item.s ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-300 text-slate-400'}`}>{item.s}</div><span className={`mt-2 text-[10px] font-black uppercase ${activeStep >= item.s ? 'text-indigo-600' : 'text-slate-400'}`}>{item.l}</span></div>
            {idx < arr.length - 1 && <div className={`flex-1 h-0.5 ${activeStep > item.s ? 'bg-indigo-600' : 'bg-slate-300'}`} />}
          </React.Fragment>
        ))}
      </div>

      <div className="bg-white border border-slate-200 rounded-[2rem] shadow-sm min-h-[400px]">
        {isLoading ? <div className="p-10 text-center"><Loader2 className="animate-spin"/></div> : (
          <>
            {activeStep === 1 && (
              <div className="p-8 space-y-6">
                <h3 className="font-bold">Langkah 1: Tentukan Lingkup Audit</h3>
                <div>
                  <label className="text-xs font-bold text-slate-500">Siklus AMI</label>
                  <select value={selectedCycle} onChange={e => setSelectedCycle(e.target.value)} className="w-full border p-3 rounded-lg mt-1">
                    {auditCycles.map((cycle: any) => (
                      <option key={cycle.id} value={cycle.name}>{cycle.name}</option>
                    ))}
                  </select>
                </div>
                <div><label className="text-xs font-bold text-slate-500">Unit / Prodi yang Diaudit</label><select value={selectedUnit} onChange={e => setSelectedUnit(e.target.value)} className="w-full border p-3 rounded-lg mt-1"><option value="">-- Pilih Unit --</option>{masterUnits.map(u => <option key={u.id} value={u.nama_unit}>{u.nama_unit}</option>)}</select></div>
                <div><label className="text-xs font-bold text-slate-500">Set Standar Acuan</label><div className="flex gap-2 mt-1"><button onClick={() => setStandardType('standar')} className={`flex-1 p-3 border-2 rounded-lg text-sm font-bold ${standardType === 'standar' ? 'border-indigo-500 bg-indigo-50' : ''}`}>Standar PEPI</button><button onClick={() => setStandardType('unggul')} className={`flex-1 p-3 border-2 rounded-lg text-sm font-bold ${standardType === 'unggul' ? 'border-indigo-500 bg-indigo-50' : ''}`}>Standar Unggul 2025</button></div></div>
              </div>
            )}
            {activeStep === 2 && (
              <div className="p-8">
                 <h3 className="font-bold mb-4">Langkah 2: Pilih Standar Audit yang Digunakan</h3>
                 <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                   {masterStandards.map(std => (
                     <label key={std.id} className={`p-4 border-2 rounded-xl cursor-pointer ${selectedStandards.includes(std.kode_standar) ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 hover:bg-slate-50'}`}><input type="checkbox" checked={selectedStandards.includes(std.kode_standar)} onChange={() => setSelectedStandards(p => p.includes(std.kode_standar) ? p.filter(s => s !== std.kode_standar) : [...p, std.kode_standar])} className="mr-3"/> <span className="font-bold text-sm">{std.kode_standar}</span></label>
                   ))}
                 </div>
              </div>
            )}
            {activeStep === 3 && (
               <div className="p-8 space-y-6">
                  <h3 className="font-bold text-lg">Langkah 3: Susun Instrumen Audit untuk {selectedUnit}</h3>
                  <div className="space-y-4">
                    {masterStandards.filter(s => selectedStandards.includes(s.kode_standar)).map((std, stdIndex) => {
                      const instrumentsForStandard = plannedInstruments.filter(i => i.standard === std.kode_standar);
                      const isOpen = openAccordion === std.kode_standar;
                      return (
                        <div key={std.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                          <div onClick={() => setOpenAccordion(isOpen ? null : std.kode_standar)} className={`w-full p-5 text-left flex justify-between items-center cursor-pointer ${isOpen ? 'border-b border-slate-200' : ''}`}>
                             <span className="font-bold text-indigo-700 text-md">{stdIndex+1}. {std.nama_standar}</span>
                             <span className="px-3 py-1 bg-violet-100 text-violet-700 text-xs font-bold rounded-full">{instrumentsForStandard.length} Pertanyaan</span>
                          </div>
                          {isOpen && (
                            <div className="p-6 space-y-4">
                              {instrumentsForStandard.map((inst, instIndex) => (
                                <div key={inst.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-start gap-4">
                                  <span className="font-bold text-sm text-slate-500 pt-0.5">{stdIndex+1}.{instIndex+1}</span>
                                  <div className="flex-1">
                                    <p className="text-sm font-bold text-slate-800">{inst.pertanyaan}</p>
                                    <p className="text-xs text-slate-500 italic mt-1">Bukti: {inst.bukti_wajib}</p>
                                  </div>
                                  <div className="flex gap-1">
                                    <button onClick={() => openEdit(inst)} className="text-slate-400 hover:text-indigo-500 p-1"><Edit size={16}/></button>
                                    <button onClick={() => handleRemoveInstrument(inst.id!)} className="text-slate-400 hover:text-rose-500 p-1"><Trash2 size={16}/></button>
                                  </div>
                                </div>
                              ))}
                              <div className="flex gap-3">
                                <button onClick={() => openManualAdd(std.kode_standar)} className="flex-1 py-4 bg-slate-50 text-slate-700 border-2 border-dashed border-slate-200 rounded-xl text-sm font-bold hover:bg-slate-100 flex items-center justify-center gap-2">
                                    <Edit size={16}/> Tambah Manual
                                </button>
                                <button onClick={() => openBankModal(std.kode_standar)} className="flex-1 py-4 bg-violet-50 text-violet-700 border-2 border-dashed border-violet-200 rounded-xl text-sm font-bold hover:bg-violet-100 flex items-center justify-center gap-2">
                                    <Plus size={16}/> Tambah dari Bank Data
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
               </div>
            )}
          </>
        )}
      </div>

      <div className="flex justify-between items-center">
        <button onClick={prevStep} disabled={activeStep === 1} className="px-6 py-3 text-sm font-bold text-slate-600 disabled:opacity-50">Kembali</button>
        {activeStep < 3 ? <button onClick={nextStep} disabled={!validationOk} className="px-6 py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg disabled:opacity-50">Lanjut</button>
        : <button onClick={handleSaveAndActivate} disabled={!validationOk} className="px-8 py-4 bg-teal-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-teal-100 disabled:opacity-50 disabled:bg-slate-400">Simpan & Aktifkan</button>}
      </div>
      
      {modalStandard && <BankDataModal isOpen={isBankModalOpen} onClose={() => setIsBankModalOpen(false)} onImport={handleImportFromBank} bank={masterQuestionBank} standardCode={modalStandard}/>}
      
      <InstrumentFormModal 
        isOpen={isFormModalOpen} 
        onClose={() => setIsFormModalOpen(false)} 
        onSave={handleSaveInstrumentForm}
        initialData={editingInstrument ? { question: editingInstrument.pertanyaan || '', proof: editingInstrument.bukti_wajib || '' } : undefined}
        title={editingInstrument ? "Edit Instrumen Audit" : "Tambah Instrumen Manual"}
      />
    </div>
  );
};

export default AuditPlanningView;
