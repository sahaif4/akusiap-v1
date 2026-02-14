
import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  BookOpen, 
  ChevronDown, 
  Save, 
  X,
  Clock,
  ClipboardCheck,
  FileText,
  Paperclip,
  AlertTriangle,
  Info
} from 'lucide-react';
import { FindingType, RiskLevel, Unit, Standard } from '../types';

// Updated PEPI Units based on Master Data
const PEPI_UNITS: Unit[] = [
  { id: 1, kode_unit: 'TMP', nama_unit: 'Prodi Teknologi Mekanisasi Pertanian', jenis_unit: 'prodi' },
  { id: 2, kode_unit: 'TAP', nama_unit: 'Prodi Tata Air Pertanian', jenis_unit: 'prodi' },
  { id: 3, kode_unit: 'THP', nama_unit: 'Prodi Teknologi Hasil Pertanian', jenis_unit: 'prodi' },
  { id: 4, kode_unit: 'DIR', nama_unit: 'Direktorat', jenis_unit: 'pendukung' },
  { id: 5, kode_unit: 'AAK', nama_unit: 'Bagian Administrasi Akademik & Kemahasiswaan', jenis_unit: 'pendukung' },
  { id: 6, kode_unit: 'UMUM', nama_unit: 'Subbagian Umum', jenis_unit: 'pendukung' },
  { id: 7, kode_unit: 'UPM', nama_unit: 'Unit Penjaminan Mutu', jenis_unit: 'pendukung' },
];

const PEPI_STANDARDS: Standard[] = [
  { id: 1, kode_standar: 'STD-01', nama_standar: 'Visi, Misi, Tujuan dan Strategi', kategori: 'Kriteria 1' },
  { id: 2, kode_standar: 'STD-02', nama_standar: 'Tata Pamong, Tata Kelola dan Kerjasama', kategori: 'Kriteria 2' },
  { id: 3, kode_standar: 'STD-03', nama_standar: 'Mahasiswa', kategori: 'Kriteria 3' },
  { id: 4, kode_standar: 'STD-04', nama_standar: 'Sumber Daya Manusia', kategori: 'Kriteria 4' },
  { id: 5, kode_standar: 'STD-05', nama_standar: 'Keuangan, Sarana dan Prasarana', kategori: 'Kriteria 5' },
  { id: 6, kode_standar: 'STD-06', nama_standar: 'Pendidikan', kategori: 'Kriteria 6' },
  { id: 7, kode_standar: 'STD-07', nama_standar: 'Penelitian', kategori: 'Kriteria 7' },
  { id: 8, kode_standar: 'STD-08', nama_standar: 'Pengabdian kepada Masyarakat', kategori: 'Kriteria 8' },
  { id: 9, kode_standar: 'STD-09', nama_standar: 'Luaran dan Capaian Tridharma', kategori: 'Kriteria 9' },
];

interface FindingFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
  initialData?: any;
}

const FindingForm: React.FC<FindingFormProps> = ({ onSubmit, onCancel, initialData }) => {
  const getInitialState = () => ({
    unit: initialData?.unit || '',
    standar: initialData?.standar || '',
    uraian: initialData?.uraian || '',
    bukti_wajib: initialData?.bukti_wajib || '',
    rencana_tindakan: initialData?.rencana_tindakan || '',
    tipe: initialData?.tipe || FindingType.MINOR,
    risiko: initialData?.risiko || RiskLevel.SEDANG,
    status: initialData?.status || 'terbuka'
  });

  const [formData, setFormData] = useState(getInitialState());

  useEffect(() => {
    setFormData(getInitialState());
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label htmlFor="unit-select" className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <Building2 size={12} className="text-indigo-500" />
            Unit Kerja / Prodi <span className="text-rose-500">*</span>
          </label>
          <div className="relative group">
            <select 
              id="unit-select"
              required
              name="unit"
              className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none pr-10 cursor-pointer text-slate-700 font-medium"
              value={formData.unit}
              onChange={(e) => setFormData({...formData, unit: e.target.value})}
            >
              <option value="" disabled>Pilih Unit Kerja...</option>
              <optgroup label="Program Studi">
                {PEPI_UNITS.filter(u => u.jenis_unit === 'prodi').map(unit => (
                  <option key={unit.id} value={unit.nama_unit}>{unit.kode_unit} - {unit.nama_unit}</option>
                ))}
              </optgroup>
              <optgroup label="Unit Pendukung">
                {PEPI_UNITS.filter(u => u.jenis_unit === 'pendukung').map(unit => (
                  <option key={unit.id} value={unit.nama_unit}>{unit.kode_unit} - {unit.nama_unit}</option>
                ))}
              </optgroup>
            </select>
            <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within:text-indigo-500 transition-colors" />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="standar-select" className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <BookOpen size={12} className="text-indigo-500" />
            Referensi Standar <span className="text-rose-500">*</span>
          </label>
          <div className="relative group">
            <select 
              id="standar-select"
              required
              name="standar"
              className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none pr-10 cursor-pointer text-slate-700 font-medium"
              value={formData.standar}
              onChange={(e) => setFormData({...formData, standar: e.target.value})}
            >
              <option value="" disabled>Pilih Standar Mutu...</option>
              {PEPI_STANDARDS.map(std => (
                <option key={std.id} value={std.kode_standar}>
                  [{std.kode_standar}] {std.nama_standar}
                </option>
              ))}
            </select>
            <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within:text-indigo-500 transition-colors" />
          </div>
        </div>
      </div>

      <div className="space-y-2 animate-in fade-in slide-in-from-top-1 duration-300">
        <div className="flex items-center justify-between">
          <label htmlFor="uraian-textarea" className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <FileText size={12} className="text-indigo-500" />
            Uraian Temuan (Ketidaksesuaian) <span className="text-rose-500 font-black">*</span>
          </label>
          <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
            <Info size={10} />
            Maks. 500 Karakter
          </div>
        </div>
        <div className="relative">
          <textarea 
            id="uraian-textarea"
            required
            name="uraian"
            rows={4}
            maxLength={500}
            placeholder="Jelaskan ketidaksesuaian yang ditemukan secara detail, objektif, and berdasarkan bukti yang ada (Contoh: RPS MK Matematika belum mencakup capaian pembelajaran terbaru)..."
            className="w-full bg-white border-2 border-slate-100 rounded-2xl px-5 py-4 text-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none resize-none shadow-sm placeholder:text-slate-300 leading-relaxed font-medium"
            value={formData.uraian}
            onChange={(e) => setFormData({...formData, uraian: e.target.value})}
          />
          <div className="absolute bottom-4 right-5 text-[10px] font-black tracking-tighter text-slate-300">
            {formData.uraian.length}/500
          </div>
        </div>
        <p className="text-[10px] text-slate-400 italic font-medium px-1">
          * Pastikan uraian temuan mencakup fakta, lokasi, and referensi standar yang dilanggar.
        </p>
      </div>
      
      <div className="space-y-2">
        <label htmlFor="rencana-textarea" className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
          <ClipboardCheck size={12} className="text-indigo-500" />
          Rencana Tindakan (Corrective Action)
          <span className="text-[9px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full ml-auto">OPSIONAL</span>
        </label>
        <textarea 
          id="rencana-textarea"
          name="rencana_tindakan"
          rows={3}
          placeholder="Tuliskan rencana perbaikan awal jika auditee sudah memberikan masukan langsung..."
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none resize-none placeholder:italic"
          value={formData.rencana_tindakan}
          onChange={(e) => setFormData({...formData, rencana_tindakan: e.target.value})}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="bukti-textarea" className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
          <Paperclip size={12} className="text-indigo-500" />
          Bukti Wajib (Evidence)
          <span className="text-[9px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full ml-auto">OPSIONAL</span>
        </label>
        <textarea 
          id="bukti-textarea"
          name="bukti_wajib"
          rows={2}
          placeholder="Sebutkan dokumen, foto, atau bukti fisik yang mendasari temuan ini..."
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none resize-none placeholder:italic"
          value={formData.bukti_wajib}
          onChange={(e) => setFormData({...formData, bukti_wajib: e.target.value})}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label htmlFor="tipe-select" className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <AlertTriangle size={12} className="text-indigo-500" />
            Jenis Temuan <span className="text-rose-500">*</span>
          </label>
          <div className="relative group">
            <select 
              id="tipe-select"
              required
              name="tipe"
              className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none pr-10 cursor-pointer text-slate-700 font-bold uppercase tracking-tight"
              value={formData.tipe}
              onChange={(e) => setFormData({...formData, tipe: e.target.value as FindingType})}
            >
              {Object.values(FindingType).map((type) => (
                <option key={type} value={type}>
                  {(type as string).toUpperCase()}
                </option>
              ))}
            </select>
            <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within:text-indigo-500 transition-colors" />
          </div>
        </div>

        <div className="space-y-3">
          <label id="risk-level-label" className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block">Level Risiko <span className="text-rose-500">*</span></label>
          <div role="radiogroup" aria-labelledby="risk-level-label" className="grid grid-cols-3 gap-2">
            {Object.values(RiskLevel).map((risk) => (
              <label 
                key={risk} 
                className={`flex items-center justify-center p-2 rounded-xl border cursor-pointer transition-all text-[10px] font-black uppercase ${
                  formData.risiko === risk 
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100' 
                    : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'
                }`}
              >
                <input 
                  id={`risk-${risk}`}
                  type="radio" 
                  name="risiko" 
                  className="hidden" 
                  checked={formData.risiko === risk}
                  onChange={() => setFormData({...formData, risiko: risk})}
                />
                {risk}
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-100">
        <div className="flex items-center justify-between gap-4 bg-slate-50 p-4 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-lg text-indigo-500 shadow-sm"><Clock size={18} /></div>
            <div>
              <p className="text-xs font-bold text-slate-900">Status Alur Kerja</p>
              <p className="text-[10px] text-slate-500">Tentukan status awal temuan ini.</p>
            </div>
          </div>
          <select 
            id="status-select"
            name="status"
            className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-indigo-600 focus:ring-2 focus:ring-indigo-500 outline-none"
            value={formData.status}
            onChange={(e) => setFormData({...formData, status: e.target.value})}
          >
            <option value="terbuka">TERBUKA</option>
            <option value="proses">DALAM PROSES</option>
            <option value="selesai">SELESAI</option>
          </select>
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <button 
          type="button" 
          onClick={onCancel}
          className="flex-1 py-3 px-4 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all active:scale-95 flex items-center justify-center gap-2"
        >
          <X size={18} />
          Batal
        </button>
        <button 
          type="submit"
          className="flex-[2] py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
        >
          <Save size={18} />
          {initialData ? 'Simpan Perubahan' : 'Simpan Temuan'}
        </button>
      </div>
    </form>
  );
};

export default FindingForm;
