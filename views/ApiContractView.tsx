import React, { useState } from 'react';
import { 
  FileCode, ShieldCheck, Database, Layers, Cpu, GitMerge, Bot, Copy, ChevronsUpDown, BarChart3, KeyRound
} from 'lucide-react';

const EndpointDef: React.FC<{
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  url: string;
  desc: string;
  role: string;
  request?: string;
  response?: string;
}> = ({ method, url, desc, role, request, response }) => {
  const methodColors: Record<typeof method, string> = {
    GET: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    POST: 'bg-blue-100 text-blue-700 border-blue-200',
    PUT: 'bg-amber-100 text-amber-700 border-amber-200',
    DELETE: 'bg-rose-100 text-rose-700 border-rose-200',
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
      <div className="p-6 border-b">
        <div className="flex items-center gap-4 mb-2">
          <span className={`px-3 py-1 text-[10px] font-black rounded-full border ${methodColors[method]}`}>{method}</span>
          <code className="text-sm font-mono font-bold bg-slate-100 text-slate-700 px-3 py-1 rounded-lg">{url}</code>
        </div>
        <p className="text-xs text-slate-500 pl-1">{desc}</p>
        <div className="mt-3 flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-200 w-fit">
            <KeyRound size={14} className="text-slate-400"/>
            <span className="text-[10px] font-bold text-slate-500">Akses: <span className="text-slate-800">{role}</span></span>
        </div>
      </div>
      <div className="p-6 bg-slate-50/50 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="text-[10px] font-black uppercase text-slate-400 mb-2">Request Payload</h4>
          <div className="bg-slate-900 rounded-xl p-4 text-xs font-mono text-sky-300 overflow-x-auto custom-scrollbar min-h-[100px]">
            <pre>{request || '// Tidak ada payload'}</pre>
          </div>
        </div>
        <div>
          <h4 className="text-[10px] font-black uppercase text-slate-400 mb-2">Response (200 OK / 201 Created)</h4>
          <div className="bg-slate-900 rounded-xl p-4 text-xs font-mono text-emerald-300 overflow-x-auto custom-scrollbar min-h-[100px]">
            <pre>{response || '// Tidak ada body respons'}</pre>
          </div>
        </div>
      </div>
    </div>
  );
};


const ApiContractView: React.FC = () => {
    const [activeTab, setActiveTab] = useState('auth');
    
    const contracts: Record<string, React.ReactNode> = {
        auth: (
            <EndpointDef
                method="POST"
                url="/api/login/"
                desc="Mengautentikasi pengguna dan mengembalikan token beserta data user & unit."
                role="Publik / Semua"
                request={`{
  "username": "string (nip/id)",
  "password": "string"
}`}
                response={`// Sukses
{
  "access": "...", "refresh": "...", "user": { ... }, "unit": { ... }
}`}
            />
        ),
        master: (
          <div className="space-y-6">
            <EndpointDef 
              method="GET"
              url="/api/users/"
              desc="Mengambil daftar semua pengguna terdaftar."
              role="Super Admin"
              response={`[ { ... user object ... } ]`}
            />
             <EndpointDef 
              method="POST"
              url="/api/units/"
              desc="Membuat unit kerja baru."
              role="Super Admin"
              request={`{ "kode_unit": "...", "nama_unit": "...", "jenis_unit": "prodi" }`}
              response={`{ ... unit object ... }`}
            />
            <EndpointDef 
              method="GET"
              url="/api/units/"
              desc="Mengambil daftar semua unit kerja."
              role="Semua Role (Terautentikasi)"
              response={`[ { ... unit object ... } ]`}
            />
          </div>
        ),
        findings: (
            <div className="space-y-6">
                <EndpointDef 
                    method="GET"
                    url="/api/findings/"
                    desc="Mengambil semua data temuan audit."
                    role="Read: Semua, Write: Super Admin"
                    response={`[ { ... finding object ... } ]`}
                />
                 <EndpointDef 
                    method="PUT"
                    url="/api/findings/{id}/"
                    desc="Memperbarui data temuan, misalnya saat mengisi RTL atau verifikasi."
                    role="Super Admin"
                    request={`{ "rencana_tindakan": "...", "tanggal_target_rtl": "..." }`}
                    response={`{ ... updated finding object ... }`}
                />
            </div>
        ),
        deskEval: (
          <div className="space-y-6">
            <EndpointDef
                method="POST"
                url="/api/instruments/"
                desc="Membuat instrumen audit baru (Tahap Perencanaan)."
                role="Super Admin, Admin Prodi"
                request={`{ "audit_cycle": 1, "standard": 1, ... }`}
                response={`{ ... instrument object ... }`}
            />
            <EndpointDef
                method="GET"
                url="/api/desk-evaluation/instruments/"
                desc="Mengambil daftar instrumen untuk suatu unit."
                role="Semua Role (Terautentikasi)"
                request={`?unit_id={unit_id}`}
                response={`[ { ... instrument object ... } ]`}
            />
             <EndpointDef
                method="POST"
                url="/api/desk-evaluation/response/"
                desc="Dikirim oleh Auditee saat mengunggah bukti atau mengisi jawaban."
                role="Auditee, Admin Prodi"
                request={`{ "instrument": 1, "answer_text": "...", ... }`}
                response={`{ ... response object ... }`}
            />
             <EndpointDef
                method="POST"
                url="/api/desk-evaluation/score/"
                desc="Dikirim oleh Auditor saat memberikan skor/catatan."
                role="Auditor"
                request={`{ "audit_response": 1, "score": 3, ... }`}
                response={`{ ... score object ... }`}
            />
          </div>
        ),
        dashboard: (
           <EndpointDef
                method="GET"
                url="/api/dashboard/"
                desc="Mengambil data agregat untuk tampilan dashboard suatu unit."
                role="Semua Role (Terautentikasi)"
                request={`?unit_code={unit_code}`}
                response={`{ "stats": {...}, "radar": [...], ... }`}
            />
        ),
        ai: (
             <EndpointDef
                method="POST"
                url="/api/analyze-finding/"
                desc="Menganalisis uraian temuan untuk mendapatkan rekomendasi."
                role="Semua Role (Terautentikasi)"
                request={`{ "uraian": "..." }`}
                response={`{ "analysis": { ... } }`}
            />
        )
    };

    const tabs = [
        { id: 'auth', label: 'Autentikasi', icon: ShieldCheck },
        { id: 'master', label: 'Master Data', icon: Database },
        { id: 'findings', label: 'Temuan & RTL', icon: Layers },
        { id: 'deskEval', label: 'Alur Desk Eval', icon: Cpu },
        { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
        { id: 'ai', label: 'Layanan AI', icon: Bot },
    ];
    
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
             <div className="bg-slate-900 text-white p-10 rounded-[3rem] shadow-2xl relative overflow-hidden border border-slate-800">
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] -mr-20 -mt-20"></div>
                <div className="relative z-10">
                    <h2 className="text-3xl font-black uppercase tracking-tighter mb-2 flex items-center gap-3"><FileCode/> Kontrak API Backend</h2>
                    <p className="text-slate-400 text-sm max-w-2xl font-medium leading-relaxed">
                        Dokumentasi teknis untuk setiap endpoint API yang digunakan oleh aplikasi frontend SIAPI.
                    </p>
                </div>
            </div>
            
            <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm w-fit">
                {tabs.map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}>
                        <tab.icon size={14}/> {tab.label}
                    </button>
                ))}
            </div>

            <div className="space-y-6">
                {contracts[activeTab]}
            </div>
        </div>
    );
};

export default ApiContractView;