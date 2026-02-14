import React, { useEffect, useState, useMemo, useRef } from 'react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area, CartesianGrid, XAxis, YAxis, Legend
} from 'recharts';
import { 
  ShieldCheck, TrendingUp, Activity, Loader2, ServerCrash, Building2, List, Clock, BarChart3,
  TrendingDown, Minus, AlertTriangle, Sparkles, ChevronDown, FilePenLine, UploadCloud, Calculator, PlusCircle,
  PieChart as PieChartIcon
} from 'lucide-react';
import { getDashboardData } from '../services/dashboardService';
import { getActivityLog } from '../services/activityLogService';
import { generateDashboardNarrative } from '../services/geminiService';
import { DashboardData, UnitCode, ActivityLogItem } from '../types/dashboard';
import { Role, CurrentUser, StrategicAgenda } from '../types';
import CountdownWidget from '../components/AccreditationCountdown';
import { getActiveStrategicAgenda } from '../services/apiService';

const ALL_UNITS: UnitCode[] = ["TMP", "THP", "TAP", "UPPS", "UPPM"];

const KRITERIA_DEFINITIONS: Record<string, string> = {
  "K1": "Visi, Misi, Tujuan, dan Strategi", "K2": "Tata Pamong, Tata Kelola, dan Kerjasama", "K3": "Mahasiswa",
  "K4": "Sumber Daya Manusia", "K5": "Keuangan, Sarana, dan Prasarana", "K6": "Pendidikan",
  "K7": "Penelitian", "K8": "Pengabdian kepada Masyarakat", "K9": "Luaran dan Capaian Tridharma",
};
const STORAGE_KEYS_AGENDA = { STRATEGIC_AGENDAS: 'siapepi_strategic_agendas' };

const INITIAL_AGENDAS: StrategicAgenda[] = [
  { id: 1, name: 'Akreditasi LAM-PTIP (TMP & TAP)', targetDate: '2026-10-01', description: 'Batas akhir pengajuan borang akreditasi untuk Prodi TMP dan TAP.', responsibleUnit: 'Prodi TMP & TAP', isActive: true },
  { id: 2, name: 'Pelaksanaan AMI Internal', targetDate: '2026-09-01', description: 'Kick-off Audit Mutu Internal untuk seluruh unit kerja di PEPI.', responsibleUnit: 'Semua Unit', isActive: false }
];

// --- SUB-COMPONENTS ---

const CustomRadarTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        const score = payload[0].value;
        const status = score >= 3.5 ? 'Sangat Baik' : score >= 3.0 ? 'Baik' : 'Perlu Perbaikan';
        const color = score >= 3.5 ? 'text-emerald-400' : score >= 3.0 ? 'text-blue-400' : 'text-amber-400';
        return (
            <div className="bg-slate-900/90 backdrop-blur-sm text-white p-4 rounded-xl shadow-lg border border-indigo-700/50">
                <p className="font-black text-indigo-300 text-xs uppercase">{label} - {KRITERIA_DEFINITIONS[label]}</p>
                <div className="flex items-baseline gap-2 mt-2">
                    <p className="text-2xl font-black">{score.toFixed(2)}</p>
                    <p className={`font-bold text-sm ${color}`}>{status}</p>
                </div>
            </div>
        );
    }
    return null;
};

const ExecutiveHeader: React.FC<any> = ({
  unit, setUnit, qualityStatus, narrative, data,
  accessibleUnits, canChangeUnit, isDropdownOpen, setIsDropdownOpen, dropdownRef, activeAgenda,
  highestCriteria, lowestCriteria
}) => {
  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl p-8 shadow-2xl shadow-slate-900/20 relative overflow-hidden">
      <div className="absolute -top-10 -right-20 w-80 h-80 bg-indigo-600/10 rounded-full blur-[100px]"></div>
      
      <div className="relative z-10">
        {/* Top section: 3 columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-8">
          
          {/* LEFT: Identity & Status */}
          <div className="lg:col-span-4 space-y-3">
            <div className="relative" ref={dropdownRef}>
              <button onClick={() => canChangeUnit && setIsDropdownOpen(!isDropdownOpen)} className={`flex items-center gap-2 ${canChangeUnit ? 'group cursor-pointer' : 'cursor-default'}`}>
                  <span className="text-white font-black text-3xl tracking-tight">{unit}</span>
                  {canChangeUnit && <ChevronDown className={`text-slate-500 group-hover:text-white transition-all ${isDropdownOpen ? 'rotate-180' : ''}`} />}
              </button>
              {isDropdownOpen && canChangeUnit && (
                  <div className="absolute top-full mt-3 w-48 bg-slate-800/90 backdrop-blur-md rounded-2xl shadow-lg border border-white/10 p-2 z-20 animate-in fade-in zoom-in-95 duration-200">
                      <ul className="space-y-1">
                          {accessibleUnits.map((u: UnitCode) => (
                              <li key={u}><button onClick={() => { setUnit(u); setIsDropdownOpen(false); }} className={`w-full text-left px-4 py-2 rounded-lg text-sm font-bold transition-colors ${unit === u ? 'bg-indigo-600 text-white' : 'text-slate-200 hover:bg-indigo-600/50'}`}>{u}</button></li>
                          ))}
                      </ul>
                  </div>
              )}
            </div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Siklus AMI 2024/2025</p>
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border ${qualityStatus.color.replace('bg-', 'border-')}/50 ${qualityStatus.color}/20 ${qualityStatus.textColor} w-fit`}>
              <div className={`w-2 h-2 rounded-full ${qualityStatus.color}`}></div>
              {qualityStatus.text}
            </div>
          </div>

          {/* CENTER: Actionable Insights */}
          <div className="lg:col-span-5 bg-white/5 border border-white/10 p-4 rounded-xl backdrop-blur-sm">
            <div className="flex items-start gap-3">
                <Sparkles size={20} className="text-indigo-300 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-slate-200 font-medium leading-relaxed">{narrative || 'Menganalisis wawasan...'}</p>
            </div>
            <div className="mt-4 pt-4 border-t border-white/10">
               <p className="text-[10px] font-bold text-slate-400 uppercase">Fokus Rekomendasi</p>
               <p className="text-sm font-bold text-amber-300">{KRITERIA_DEFINITIONS[lowestCriteria.criteria]}</p>
               <p className="text-[10px] font-bold text-slate-400 uppercase mt-2">Tindakan Berikutnya</p>
               <p className="text-sm font-bold text-white">Finalisasi Rencana Tindak Lanjut (RTL)</p>
            </div>
          </div>

          {/* RIGHT: Strategic Agenda */}
          <div className="lg:col-span-3">
            <CountdownWidget agenda={activeAgenda} />
          </div>
        </div>

        {/* Bottom section: Micro KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-1"><BarChart3 size={14} className="text-indigo-300"/><h4 className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">Skor Rata-Rata</h4></div>
            <p className="text-2xl font-black">{data.stats.average_score.toFixed(2)}</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-1"><AlertTriangle size={14} className="text-rose-400"/><h4 className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">Temuan Aktif</h4></div>
            <p className="text-2xl font-black">{data.stats.total_findings}</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-1"><TrendingUp size={14} className="text-emerald-300"/><h4 className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">Kriteria Terkuat</h4></div>
            <p className="text-2xl font-black">{highestCriteria.criteria}</p>
          </div>
           <div className="bg-white/5 border border-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-1"><TrendingDown size={14} className="text-amber-400"/><h4 className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">Perlu Perhatian</h4></div>
            <p className="text-2xl font-black">{lowestCriteria.criteria}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const AuditorHeader: React.FC<any> = ({
  unit, setUnit, data,
  accessibleUnits, canChangeUnit, isDropdownOpen, setIsDropdownOpen, dropdownRef, activeAgenda
}) => {
  const progress = data.composition.reduce((acc: number, curr: any) => (curr.name === 'Patuh' || curr.name === 'Patuh Bersyarat' ? acc + curr.value : acc), 0);
  const totalInstruments = data.radar.length;
  const answeredInstruments = Math.round(totalInstruments * (progress / 100));

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm flex flex-col lg:flex-row items-center gap-8">
      <div className="flex-1 w-full">
        <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Dashboard Operasional</p>
        <div className="relative" ref={dropdownRef}>
          <button onClick={() => canChangeUnit && setIsDropdownOpen(!isDropdownOpen)} className={`flex items-center gap-2 ${canChangeUnit ? 'group cursor-pointer' : 'cursor-default'}`}>
            <h3 className="text-2xl font-black text-slate-900 mb-1">Unit Audit: {unit}</h3>
            {canChangeUnit && <ChevronDown className={`text-slate-400 group-hover:text-slate-800 transition-all ${isDropdownOpen ? 'rotate-180' : ''}`} />}
          </button>
          {isDropdownOpen && canChangeUnit && (
              <div className="absolute top-full mt-2 w-56 bg-white backdrop-blur-md rounded-2xl shadow-lg border border-slate-100 p-2 z-20">
                  <ul className="space-y-1">
                      {accessibleUnits.map((u: UnitCode) => (
                          <li key={u}><button onClick={() => { setUnit(u); setIsDropdownOpen(false); }} className={`w-full text-left px-4 py-2 rounded-lg text-sm font-bold transition-colors ${unit === u ? 'bg-indigo-600 text-white' : 'text-slate-700 hover:bg-indigo-50'}`}>{u}</button></li>
                      ))}
                  </ul>
              </div>
          )}
        </div>
        <div className="space-y-2 mt-4">
          <div className="flex justify-between items-baseline mb-1"><p className="text-xs font-bold text-slate-600">Progres Kelengkapan Bukti</p><p className="text-lg font-black text-indigo-600">{progress}%</p></div>
          <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden"><div className="h-full bg-indigo-500 rounded-full" style={{ width: `${progress}%` }}></div></div>
          <div className="flex justify-between text-[10px] font-bold text-slate-400"><span>{answeredInstruments} dari {totalInstruments} instrumen terjawab</span><span>{totalInstruments - answeredInstruments} Tertunda</span></div>
        </div>
      </div>
      <div className="w-px bg-slate-200 self-stretch hidden lg:block"></div>
      <div className="flex flex-col gap-4 w-full lg:w-auto">
         <div className="w-full lg:w-80"><CountdownWidget agenda={activeAgenda} /></div>
         <div className="flex flex-row gap-4">
           <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex-1 flex flex-col justify-center items-center text-center"><p className="text-[10px] font-black text-slate-400 uppercase">Temuan</p><p className="text-3xl font-black text-slate-800">{data?.stats?.total_findings || 0}</p><p className="text-[10px]"><span className="font-bold text-rose-500">{data?.stats?.major_findings || 0} M</span> / <span className="font-bold text-amber-500">{data?.stats?.minor_findings || 0} m</span></p></div>
           <div className="flex-1 grid grid-cols-2 gap-2"><button className="p-2 bg-indigo-600 text-white rounded-xl text-[9px] font-bold uppercase flex flex-col items-center justify-center text-center shadow-lg hover:bg-indigo-700"><PlusCircle size={20} className="mb-1"/>Input Temuan</button><button className="p-2 bg-slate-50 border border-slate-200 text-slate-500 rounded-xl text-[9px] font-bold uppercase flex flex-col items-center justify-center text-center hover:bg-slate-100"><UploadCloud size={20} className="mb-1"/>Upload Bukti</button><button className="p-2 col-span-2 bg-slate-50 border border-slate-200 text-slate-500 rounded-xl text-[9px] font-bold uppercase flex flex-col items-center justify-center text-center hover:bg-slate-100"><Calculator size={20} className="mb-1"/>Hitung Skor Final</button></div>
         </div>
      </div>
    </div>
  );
};


// --- MAIN COMPONENT ---

const DashboardView: React.FC<{ currentUser: CurrentUser | null }> = ({ currentUser }) => {
  const [showAnalytics, setShowAnalytics] = useState(false);
  
  const accessibleUnits = useMemo(() => {
    if (!currentUser) return [];
    const { role, unitCode, assignedUnits } = currentUser;

    if ([Role.SUPER_ADMIN, Role.ADMIN_UPM, Role.PIMPINAN, Role.WADIR].includes(role)) {
      return ALL_UNITS;
    }
    if ([Role.ADMIN_PRODI, Role.KAPRODI, Role.AUDITEE].includes(role)) {
      return unitCode ? [unitCode as UnitCode] : [];
    }
    if (role === Role.AUDITOR) {
      return (assignedUnits as UnitCode[]) || [];
    }
    return [];
  }, [currentUser]);

  const [unit, setUnit] = useState<UnitCode>(accessibleUnits[0] || "TMP");
  const [data, setData] = useState<DashboardData | null>(null);
  const [activityLog, setActivityLog] = useState<ActivityLogItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [narrative, setNarrative] = useState<string | null>(null);
  const [highlightedCriteria, setHighlightedCriteria] = useState<string | null>(null);
  const [pinnedCriteria, setPinnedCriteria] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [activeAgenda, setActiveAgenda] = useState<StrategicAgenda | null>(null);

  const LOW_SCORE_THRESHOLD = 3.0;
  const activeCriteria = highlightedCriteria || pinnedCriteria;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => { if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setIsDropdownOpen(false); };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  useEffect(() => {
    if (accessibleUnits.length > 0 && !accessibleUnits.includes(unit)) {
      setUnit(accessibleUnits[0]);
    }
  }, [accessibleUnits, unit]);

  useEffect(() => {
    if (!showAnalytics || !currentUser || accessibleUnits.length === 0) {
      if (!currentUser || accessibleUnits.length === 0) {
        setError("Tidak ada unit yang dapat diakses untuk peran Anda.");
      }
      return;
    }

    setLoading(true);
    setError(null);
    setData(null);
    setNarrative(null);

  let agendas: StrategicAgenda[] = INITIAL_AGENDAS;
  const savedAgendas = localStorage.getItem(STORAGE_KEYS_AGENDA.STRATEGIC_AGENDAS);
  if (savedAgendas) {
      try {
          const parsed = JSON.parse(savedAgendas);
          if (Array.isArray(parsed) && parsed.length > 0) agendas = parsed;
      } catch (e) { console.error("Failed to parse agendas, using default.", e); }
  }
  setActiveAgenda(agendas.find(a => a.isActive) || null);

  const fetchData = async () => {
    try {
      const [dashboardData, logData] = await Promise.all([ getDashboardData(unit, currentUser), getActivityLog() ]);
      setData(dashboardData);
      setActivityLog(logData);
      try {
        const apiAgenda = await getActiveStrategicAgenda(unit);
        if (apiAgenda) setActiveAgenda(apiAgenda);
      } catch (e) {
        console.warn("Gagal mengambil agenda aktif dari API, menggunakan fallback.", e);
      }
      if (dashboardData) {
        const summary = await generateDashboardNarrative(dashboardData, KRITERIA_DEFINITIONS);
        setNarrative(summary);
      }
    } catch (err: any) {
        console.error("Dashboard Fetch Error:", err);
        setError(err.message || "Gagal memuat data dashboard.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [unit, currentUser, accessibleUnits, showAnalytics]);
  
  const qualityStatus = useMemo(() => {
    if (!data || !data.stats) return { text: '-', color: 'bg-slate-500', icon: <Minus/> };
    const score = data.stats.average_score ?? 0;
    if (score >= 3.5) return { text: 'Sangat Baik', color: 'bg-emerald-500', textColor: 'text-emerald-500' };
    if (score >= 3.0) return { text: 'Baik', color: 'bg-blue-500', textColor: 'text-blue-500' };
    return { text: 'Perlu Perbaikan', color: 'bg-amber-500', textColor: 'text-amber-500' };
  }, [data]);
  
  const trendStatus = useMemo(() => {
    if (!data || !data.trends || data.trends.length < 2) return { text: 'Stabil', icon: <Minus className="text-slate-400"/> };
    const last = data.trends[data.trends.length - 1].findings;
    const prev = data.trends[data.trends.length - 2].findings;
    if (last < prev) return { text: 'Membaik', icon: <TrendingUp className="text-emerald-500"/> };
    if (last > prev) return { text: 'Menurun', icon: <TrendingDown className="text-rose-500"/> };
    return { text: 'Stabil', icon: <Minus className="text-slate-400"/> };
  }, [data]);

  const { highestCriteria, lowestCriteria } = useMemo(() => {
    if (!data || !data.radar || data.radar.length === 0) {
      return { highestCriteria: { criteria: '-', score: 0 }, lowestCriteria: { criteria: '-', score: 0 } };
    }
    const highest = data.radar.reduce((max, p) => p.score > max.score ? p : max, data.radar[0]);
    const lowest = data.radar.reduce((min, p) => p.score < min.score ? p : min, data.radar[0]);
    return { highestCriteria: highest, lowestCriteria: lowest };
  }, [data]);

  const isExecutive = currentUser && [Role.PIMPINAN, Role.WADIR, Role.SUPER_ADMIN, Role.ADMIN_UPM].includes(currentUser.role);
  const canChangeUnit = accessibleUnits.length > 1;

  if (!showAnalytics) {
    return (
      <div className="space-y-6 animate-in fade-in duration-500 pb-12 text-center flex flex-col items-center justify-center h-full">
        <div className="p-6 bg-indigo-600 rounded-full text-white shadow-2xl shadow-indigo-200">
            <BarChart3 size={48} />
        </div>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Selamat Datang, {currentUser?.name}!</h2>
        <p className="text-slate-500 font-medium max-w-lg">
            Dasbor analitik Anda siap dimuat. Proses ini akan mengagregasi data dari seluruh instrumen dan temuan untuk memberikan wawasan strategis.
        </p>
        <button
            onClick={() => setShowAnalytics(true)}
            className="mt-4 px-8 py-4 bg-indigo-600 text-white rounded-2xl text-sm font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center gap-2"
        >
            <TrendingUp size={18}/> Tampilkan Analitik Dasbor
        </button>
      </div>
    );
  }

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-slate-500">
        <Loader2 size={48} className="animate-spin text-indigo-600" />
        <p className="mt-4 text-sm font-bold">Memuat data analitik untuk <span className="text-indigo-600">{unit}</span>...</p>
      </div>
    );
  }

  if (error || !data || !data.stats) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[60vh] bg-rose-50 border border-rose-200 rounded-2xl p-8">
        <ServerCrash size={48} className="text-rose-400" />
        <h3 className="mt-4 text-lg font-bold text-rose-800">Akses Ditolak atau Terjadi Kesalahan</h3>
        <p className="mt-1 text-sm text-rose-600 text-center max-w-sm">{error || "Tidak ada data untuk ditampilkan."}</p>
        <button onClick={() => window.location.reload()} className="mt-6 px-4 py-2 bg-rose-600 text-white text-xs font-bold rounded-lg hover:bg-rose-700">Coba Lagi</button>
      </div>
    );
  }

  const headerProps = { unit, setUnit, data, qualityStatus, narrative, trendStatus, accessibleUnits, canChangeUnit, isDropdownOpen, setIsDropdownOpen, dropdownRef, activeAgenda, highestCriteria, lowestCriteria };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      
      {isExecutive ? <ExecutiveHeader {...headerProps} /> : <AuditorHeader {...headerProps} />}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-3xl shadow-lg shadow-slate-200/50 border border-slate-100">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2 mb-4"><BarChart3 className="text-indigo-600" size={20} /> Peta Mutu (9 Kriteria)</h3>
            <div className="h-[400px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data.radar} onMouseLeave={() => setHighlightedCriteria(null)}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis 
                    dataKey="criteria" 
                    tick={(props) => { 
                      const { x, y, payload } = props; 
                      const score = data.radar.find(r => r.criteria === payload.value)?.score || 0; 
                      const isActive = activeCriteria === payload.value;
                      const needsAttention = score < LOW_SCORE_THRESHOLD; 
                      
                      let fill = '#64748b'; // default slate
                      if (isActive) {
                        fill = '#4f46e5'; // active indigo
                      } else if (needsAttention) {
                        fill = '#ef4444'; // low score red
                      }

                      return (
                        <text 
                          x={x} y={y} dy={4} 
                          textAnchor="middle" 
                          fill={fill} 
                          fontSize={12} 
                          fontWeight={isActive || needsAttention ? 700 : 500}
                          onMouseEnter={() => setHighlightedCriteria(payload.value)}
                          onClick={() => setPinnedCriteria(prev => prev === payload.value ? null : payload.value)}
                          className="cursor-pointer"
                        >
                          {payload.value}
                        </text>
                      ); 
                    }} 
                  />
                  <Radar name="Skor" dataKey="score" stroke="#4f46e5" strokeWidth={2} fill={activeCriteria ? "#c7d2fe" : "#4f46e5"} fillOpacity={activeCriteria ? 0.8 : 0.3} />
                  <Tooltip content={<CustomRadarTooltip />} cursor={{ stroke: '#4f46e5', strokeWidth: 1, strokeDasharray: '3 3' }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-3xl shadow-lg shadow-slate-200/50 border border-slate-100"><h3 className="text-base font-black text-slate-900 mb-6 flex items-center gap-2"><TrendingUp className="text-rose-500" size={18} /> Tren Temuan per Periode</h3><div className="h-60 relative"><ResponsiveContainer width="100%" height="100%"><AreaChart data={data.trends} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}><defs><linearGradient id="colorFindings" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/><stop offset="95%" stopColor="#ef4444" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" /><XAxis dataKey="period" stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} /><YAxis stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} /><Tooltip /><Area type="monotone" dataKey="findings" stroke="#ef4444" fill="url(#colorFindings)" strokeWidth={2} /></AreaChart></ResponsiveContainer></div></div>
            <div className="bg-white p-6 rounded-3xl shadow-lg shadow-slate-200/50 border border-slate-100"><h3 className="text-base font-black text-slate-900 mb-6 flex items-center gap-2"><PieChartIcon className="text-emerald-500" size={18} /> Komposisi Kepatuhan</h3><div className="h-60 flex items-center justify-center relative"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={data.composition} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" nameKey="name">{data.composition.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} stroke={entry.color} />)}</Pie><Tooltip /><Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px', fontWeight: 'bold' }} /></PieChart></ResponsiveContainer></div></div>
          </div>
        </div>
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl shadow-lg shadow-slate-200/50 border border-slate-100">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2 mb-4"><List className="text-indigo-600" size={18}/> Legenda Kriteria</h3>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(KRITERIA_DEFINITIONS).map(([key, value]) => {
                const score = data.radar.find(r => r.criteria === key)?.score || 0;
                const needsAttention = score < LOW_SCORE_THRESHOLD;
                const isActive = activeCriteria === key;

                return (
                  <div 
                    key={key} 
                    onMouseEnter={() => setHighlightedCriteria(key)} 
                    onMouseLeave={() => setHighlightedCriteria(null)}
                    onClick={() => setPinnedCriteria(prev => prev === key ? null : key)}
                    className={`p-3 rounded-xl cursor-pointer transition-all border ${
                      isActive 
                        ? 'bg-indigo-600 text-white shadow-lg border-indigo-600' 
                        : `bg-slate-50 hover:bg-slate-100 ${needsAttention ? 'border-rose-300' : 'border-transparent'}`
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-black text-sm">{key}</span>
                      {needsAttention && !isActive && <div className="w-2 h-2 bg-rose-500 rounded-full"></div>}
                    </div>
                    <p className={`text-[9px] leading-tight mt-1 ${isActive ? 'opacity-80' : 'opacity-70'}`}>{value.split(',')[0]}</p>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-lg shadow-slate-200/50 border border-slate-100"><h3 className="text-base font-black text-slate-900 flex items-center gap-2 mb-4"><Clock className="text-indigo-600" size={18}/> Aktivitas Terbaru</h3><div className="relative space-y-4"><div className="absolute left-5 top-2 bottom-2 w-0.5 bg-slate-100"></div>{activityLog.slice(0, 5).map(log => (<div key={log.id} className="relative z-10 flex items-start gap-4"><div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm border-4 border-white shadow-sm flex-shrink-0">{log.avatar}</div><div><p className="text-xs text-slate-600 leading-snug"><span className="font-bold text-slate-800">{log.user}</span><span className="italic text-slate-500 mx-1">{log.action}</span><span className="font-bold text-indigo-600">{log.target}</span>.</p><p className="text-[10px] text-slate-400 font-bold mt-1">{log.timestamp}</p></div></div>))}</div></div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
