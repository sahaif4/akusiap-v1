
import React, { useState, useEffect, useRef } from 'react';
import { 
  FileJson, X, Paperclip, CheckSquare, Square, Edit, Send, CheckCircle2,
  Trash2, BookOpen, AlertCircle, Save, Check, FileUp
} from 'lucide-react';
import { Instrument, DocumentStatus } from '../types';
import * as apiService from '../services/apiService';

// --- DATA STATIS UNTUK MODAL (Bisa diganti API nanti) ---
const PEPI_STANDARDS = [
  { id: 1, kode: 'STD-01', nama: 'Visi, Misi, Tujuan, dan Strategi' },
  { id: 2, kode: 'STD-02', nama: 'Tata Pamong, Tata Kelola, dan Kerjasama' },
  { id: 3, kode: 'STD-03', nama: 'Mahasiswa' },
  { id: 4, kode: 'STD-04', nama: 'Sumber Daya Manusia' },
  { id: 5, kode: 'STD-05', nama: 'Keuangan, Sarana, dan Prasarana' },
  { id: 6, kode: 'STD-06', nama: 'Pendidikan' },
  { id: 7, kode: 'STD-07', nama: 'Penelitian' },
  { id: 8, kode: 'STD-08', nama: 'Pengabdian kepada Masyarakat' },
  { id: 9, kode: 'STD-09', nama: 'Luaran dan Capaian Tridharma' },
];

const SYSTEM_TEMPLATES: Record<string, { q: string, proof: string }[]> = {
  'STD-01': [
    { q: 'Apakah terdapat kebijakan tertulis Rektor/Dekan tentang visi, misi, tujuan dan strategi pencapaian beserta sosialisasinya?', proof: 'SK Rektor/Dekan, Dokumen VMTS, Bukti Sosialisasi (Notulen/Daftar Hadir)' },
    { q: 'Bagaimana kesesuaian VMTS Prodi dengan VMTS UPPS dan PT? Jelaskan mekanisme penyusunannya.', proof: 'Matriks Kesesuaian VMTS, Berita Acara Penyusunan' },
    { q: 'Apakah terdapat bukti evaluasi ketercapaian VMTS yang terdokumentasi dan dianalisis secara berkala?', proof: 'Laporan Evaluasi Diri (LED), Notulensi Rapat Tinjauan Manajemen (RTM), Hasil Survey Kepuasan Pemangku Kepentingan.' }
  ],
  'STD-02': [
    { q: 'Apakah struktur organisasi dan tata pamong program studi terdokumentasi dengan jelas?', proof: 'Dokumen Struktur Organisasi, SK Jabatan, Uraian Tugas (Job Description).' },
    { q: 'Tunjukkan bukti kerjasama (MoU/MoA) dengan industri/dunia kerja yang aktif dan relevan dengan capaian pembelajaran lulusan.', proof: 'Dokumen MoU/MoA, Laporan Implementasi Kerjasama (Magang, Dosen Industri, Riset Bersama).' }
  ],
  'STD-03': [
    { q: 'Apakah kebijakan dan instrumen seleksi mahasiswa baru terdokumentasi, transparan, dan telah disosialisasikan?', proof: 'SOP Penerimaan Mahasiswa Baru, Brosur/Website PMB, Kriteria Kelulusan Seleksi.' },
    { q: 'Apakah tersedia layanan kemahasiswaan yang memadai (konseling, pengembangan minat bakat, layanan karir, beasiswa)?', proof: 'SK Tim Konseling, Dokumentasi Kegiatan UKM, Laporan Tracer Study, Data Penerima Beasiswa.' }
  ],
  'STD-04': [
    { q: 'Bagaimana rasio jumlah dosen tetap terhadap jumlah mahasiswa? Tunjukkan analisis kecukupannya.', proof: 'Data Dosen di PDDIKTI, Data jumlah mahasiswa aktif per semester.' },
    { q: 'Tunjukkan bukti pengembangan kompetensi dosen (pelatihan, seminar, sertifikasi) yang relevan dengan bidang ajar.', proof: 'Sertifikat Pelatihan Dosen, Surat Tugas Seminar, Laporan Kegiatan Pengembangan Diri.' },
    { q: 'Apakah terdapat evaluasi kinerja dosen dan tenaga kependidikan secara berkala dan terdokumentasi?', proof: 'Instrumen Evaluasi Kinerja (EDOM), Laporan Hasil Evaluasi, Bukti Tindak Lanjut Hasil Evaluasi.' }
  ],
  'STD-05': [
    { q: 'Apakah alokasi dan realisasi penggunaan dana telah sesuai dengan perencanaan dan mendukung tridharma perguruan tinggi?', proof: 'Rencana Kerja dan Anggaran (RKA), Laporan Keuangan Tahunan, Bukti Pembelian Aset.' },
    { q: 'Bagaimana kondisi, aksesibilitas, dan kelengkapan sarana prasarana (ruang kelas, laboratorium, perpustakaan)?', proof: 'Daftar Inventaris Aset, Logbook Pemanfaatan Lab, Jadwal Perawatan/Kalibrasi.' }
  ],
  'STD-06': [
    { q: 'Apakah kurikulum telah ditinjau secara berkala dengan melibatkan pemangku kepentingan internal dan eksternal (industri, alumni)?', proof: 'Notulensi Rapat Tinjauan Kurikulum, Daftar Hadir, Berita Acara Kesepakatan Kurikulum.' },
    { q: 'Tunjukkan contoh Rencana Pembelajaran Semester (RPS) yang lengkap dan selaras dengan CPL.', proof: 'Dokumen RPS beberapa mata kuliah inti.' },
    { q: 'Bagaimana mekanisme monitoring dan evaluasi proses pembelajaran (kehadiran dosen, ketercapaian materi)?', proof: 'Logbook/Jurnal Perkuliahan, Laporan Monitoring oleh GKM/UPM, Hasil Ujian (UTS/UAS).' }
  ],
  'STD-07': [
    { q: 'Apakah terdapat roadmap penelitian dosen yang selaras dengan VMTS program studi?', proof: 'Dokumen Roadmap Penelitian Prodi/Jurusan.' },
    { q: 'Tunjukkan bukti luaran penelitian dosen yang dipublikasikan di jurnal bereputasi atau mendapatkan HKI.', proof: 'Link artikel jurnal, Sertifikat HKI (Paten/Hak Cipta).' }
  ],
  'STD-08': [
    { q: 'Apakah terdapat roadmap PkM yang relevan dengan kebutuhan masyarakat dan bidang keilmuan prodi?', proof: 'Dokumen Roadmap PkM Prodi/Jurusan.' },
    { q: 'Tunjukkan bukti kegiatan PkM yang melibatkan partisipasi aktif mahasiswa.', proof: 'Laporan Kegiatan PkM, Daftar Hadir Mahasiswa, Dokumentasi Foto/Video.' }
  ],
  'STD-09': [
    { q: 'Bagaimana data rata-rata masa studi dan IPK lulusan dalam 3 tahun terakhir?', proof: 'Laporan Kelulusan dari SIAKAD, Data Tracer Study.' },
    { q: 'Tunjukkan bukti prestasi akademik/non-akademik mahasiswa di tingkat wilayah, nasional, atau internasional.', proof: 'Sertifikat/Piagam Juara, Surat Keputusan Pemenang Lomba.' }
  ]
};


interface InstrumentBankModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'planning' | 'evaluation';
  onImportItems?: (items: { q: string, proof: string, standard: string }[]) => void;
  onSaveEvaluation?: (updatedInstruments: Instrument[]) => void;
  initialInstruments?: Instrument[];
}

const InstrumentBankModal: React.FC<InstrumentBankModalProps> = ({ 
  isOpen, onClose, mode, onImportItems, onSaveEvaluation, initialInstruments = [] 
}) => {
  const [selectedStandard, setSelectedStandard] = useState(PEPI_STANDARDS[0].kode);
  
  // State for 'planning' mode
  const [planningItems, setPlanningItems] = useState<{ q: string, proof: string, selected: boolean }[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // State for 'evaluation' mode
  const [evaluationInstruments, setEvaluationInstruments] = useState<Instrument[]>([]);

  useEffect(() => {
    if (isOpen) {
      if (mode === 'planning') {
        const items = SYSTEM_TEMPLATES[selectedStandard] || [];
        setPlanningItems(items.map(i => ({ ...i, selected: true })));
        setEditingIndex(null); // Reset editing on tab change
      } else if (mode === 'evaluation') {
        const filtered = initialInstruments.filter(i => i.standard === selectedStandard);
        setEvaluationInstruments(filtered);
      }
    }
  }, [isOpen, selectedStandard, mode, initialInstruments]);

  const handleItemChange = (index: number, field: 'q' | 'proof', value: string) => {
    const newItems = [...planningItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setPlanningItems(newItems);
  };

  const handleImport = () => {
    if (onImportItems) {
      const selected = planningItems.filter(i => i.selected).map(i => ({ ...i, standard: selectedStandard }));
      onImportItems(selected);
    }
  };

  const handleSaveEval = async () => {
    if (onSaveEvaluation) {
      for (const inst of evaluationInstruments) {
        await apiService.saveDeskEvaluation(inst.id, {
          catatan_desk: inst.catatan_desk,
          skor_desk: inst.skor_desk,
          doc_status: inst.doc_status,
          doc_note: inst.doc_note
        });
      }
      onSaveEvaluation(evaluationInstruments);
    }
  };

  const updateEvaluationItem = (id: number, field: keyof Instrument, value: any) => {
    setEvaluationInstruments(prev => prev.map(inst => inst.id === id ? { ...inst, [field]: value } : inst));
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-white w-full max-w-7xl rounded-2xl shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col h-[90vh] overflow-hidden">
        
        <div className="p-6 border-b border-slate-200 flex justify-between items-center flex-shrink-0 bg-slate-50">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-100 rounded-xl border border-indigo-200">
              <FileJson size={24} className="text-indigo-600"/>
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">
                {mode === 'planning' ? 'Bank Data Instrumen' : 'Workspace Desk Evaluation'}
              </h3>
              <p className="text-sm text-slate-500 font-medium">
                {mode === 'planning' ? 'Pilih pertanyaan untuk diimpor ke dalam rencana audit.' : `Mengevaluasi unit: ${initialInstruments[0]?.unit_target || ''}`}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 bg-slate-200/70 hover:bg-slate-200 rounded-full text-slate-500 hover:text-slate-700 transition-colors">
            <X size={20}/>
          </button>
        </div>

        <div className="flex-1 overflow-hidden flex">
          <div className="w-1/3 md:w-1/4 overflow-y-auto p-4 bg-slate-50 border-r border-slate-200">
            <p className="text-[10px] font-black uppercase text-slate-400 mb-3 px-2">Pilih Kriteria</p>
            {PEPI_STANDARDS.map(std => (
              <button key={std.id} onClick={() => setSelectedStandard(std.kode)} className={`w-full text-left p-4 rounded-xl mb-2 transition-all ${selectedStandard === std.kode ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-700 hover:bg-indigo-50'}`}>
                <span className="font-bold text-sm">{std.kode}</span>
                <span className={`block text-xs font-medium mt-1 ${selectedStandard === std.kode ? 'text-indigo-200' : 'text-slate-500'}`}>{std.nama}</span>
              </button>
            ))}
          </div>
          
          <div className="flex-1 overflow-y-auto p-8 bg-slate-100">
            {mode === 'planning' ? (
              <div className="space-y-4">
                {planningItems.map((item, idx) => (
                  <div key={idx} className={`p-5 rounded-2xl border bg-white transition-all ${item.selected ? 'border-indigo-300 ring-2 ring-indigo-100' : 'border-slate-200 hover:border-slate-300'}`}>
                    <div className="flex items-start gap-4">
                      <div onClick={() => { const n = [...planningItems]; n[idx].selected = !n[idx].selected; setPlanningItems(n); }} className="mt-1 w-5 h-5 flex-shrink-0 cursor-pointer">
                        {item.selected ? <CheckSquare size={20} className="text-indigo-600"/> : <Square size={20} className="text-slate-300"/>}
                      </div>
                      <div className="flex-1">
                        {editingIndex === idx ? (
                          <div className="space-y-3">
                            <textarea value={item.q} onChange={(e) => handleItemChange(idx, 'q', e.target.value)} className="w-full p-2 border border-indigo-300 rounded-lg text-sm" rows={3}/>
                            <textarea value={item.proof} onChange={(e) => handleItemChange(idx, 'proof', e.target.value)} className="w-full p-2 border border-indigo-300 rounded-lg text-xs" rows={2}/>
                            <div className="flex gap-2">
                               <button onClick={() => setEditingIndex(null)} className="px-3 py-1 bg-emerald-500 text-white rounded text-xs font-bold flex items-center gap-1"><Save size={12}/> Simpan</button>
                               <button onClick={() => setEditingIndex(null)} className="text-xs font-bold text-slate-400">Batal</button>
                            </div>
                          </div>
                        ) : (
                          <div onClick={() => setEditingIndex(idx)} className="cursor-pointer">
                            <p className="text-sm font-bold text-slate-800 leading-relaxed mb-3">{item.q}</p>
                            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg text-xs text-slate-600 border border-slate-200">
                              <FileUp size={16} className="text-slate-400 flex-shrink-0 mt-0.5"/>
                              <span className="font-medium italic">{item.proof}</span>
                            </div>
                          </div>
                        )}
                      </div>
                      {editingIndex !== idx && (
                        <button onClick={() => setEditingIndex(idx)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg">
                          <Edit size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : ( // mode === 'evaluation'
              <div className="space-y-6">
                {evaluationInstruments.map(inst => (
                  <div key={inst.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                    <p className="font-bold text-slate-800 mb-4">{inst.pertanyaan}</p>
                    <div className="flex items-start gap-2 p-3 bg-slate-100 rounded-lg text-xs text-slate-600 border border-slate-200 mb-4">
                      <Paperclip size={14} className="text-slate-400 flex-shrink-0 mt-0.5"/>
                      <span className="font-medium italic">Bukti Wajib: {inst.bukti_wajib}</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                       <div className="md:col-span-2">
                          <label className="text-[10px] font-bold text-slate-500 uppercase">Catatan Desk Evaluation</label>
                          <textarea 
                            value={inst.catatan_desk || ''}
                            onChange={(e) => updateEvaluationItem(inst.id, 'catatan_desk', e.target.value)}
                            className="w-full mt-1 p-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 h-24 resize-none bg-white" 
                            placeholder="Analisis kesesuaian dokumen bukti..."
                          />
                       </div>
                       <div className="space-y-2">
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Skor Awal</label>
                            <select 
                              value={inst.skor_desk ?? ''}
                              onChange={(e) => updateEvaluationItem(inst.id, 'skor_desk', parseInt(e.target.value))}
                              className="w-full mt-1 p-3 border bg-white border-slate-200 rounded-xl text-sm font-bold outline-none"
                            >
                                <option value="">-</option>
                                {[0,1,2,3,4].map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                          </div>
                          <div>
                             <label className="text-[10px] font-bold text-slate-500 uppercase">Status</label>
                             <div className="flex gap-2 mt-1">
                                <button onClick={() => updateEvaluationItem(inst.id, 'doc_status', DocumentStatus.APPROVED)} className={`flex-1 p-2 rounded-lg text-xs font-bold ${inst.doc_status === DocumentStatus.APPROVED ? 'bg-emerald-600 text-white' : 'bg-white border'}`}>Valid</button>
                                <button onClick={() => updateEvaluationItem(inst.id, 'doc_status', DocumentStatus.REJECTED)} className={`flex-1 p-2 rounded-lg text-xs font-bold ${inst.doc_status === DocumentStatus.REJECTED ? 'bg-rose-600 text-white' : 'bg-white border'}`}>Tolak</button>
                             </div>
                          </div>
                       </div>
                    </div>
                    {inst.doc_status === DocumentStatus.REJECTED && (
                        <div className="mt-2">
                            <label className="text-[10px] font-bold text-rose-500 uppercase">Alasan Penolakan</label>
                            <input 
                                type="text"
                                value={inst.doc_note || ''}
                                onChange={(e) => updateEvaluationItem(inst.id, 'doc_note', e.target.value)}
                                placeholder="Contoh: Dokumen tidak relevan/kadaluarsa"
                                className="w-full mt-1 p-2 border border-rose-200 rounded-lg text-xs text-rose-800 bg-rose-50"
                            />
                        </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="p-4 border-t bg-slate-50 flex justify-end gap-3 flex-shrink-0">
          <button onClick={onClose} className="px-6 py-3 text-sm font-bold text-slate-600 bg-slate-200 hover:bg-slate-300 rounded-xl transition-colors">Tutup</button>
          {mode === 'planning' ? (
            <button onClick={handleImport} className="px-6 py-3 bg-indigo-600 text-white rounded-xl text-sm font-black uppercase tracking-widest shadow-lg hover:bg-indigo-700 transition-all flex items-center gap-2">
              <FileUp size={16}/> Impor ({planningItems.filter(i => i.selected).length}) Pertanyaan
            </button>
          ) : (
            <button onClick={handleSaveEval} className="px-6 py-3 bg-emerald-600 text-white rounded-xl text-sm font-black uppercase tracking-widest shadow-lg hover:bg-emerald-700 transition-all flex items-center gap-2">
              <Save size={16}/> Simpan Evaluasi
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default InstrumentBankModal;
