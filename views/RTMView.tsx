
import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Video, 
  Users, 
  CheckCircle2, 
  XCircle, 
  Mail, 
  FileText, 
  Sparkles, 
  PenTool, 
  Printer, 
  Save, 
  Download,
  Share2,
  Mic,
  UploadCloud,
  ShieldCheck,
  ChevronRight,
  Plus,
  Send,
  Edit2,
  X,
  Copy
} from 'lucide-react';
import { generateRTMMinutes, generateFormalInvitation } from '../services/geminiService';

const STORAGE_KEYS = {
  RTM_INFO: 'siapepi_rtm_info',
  RTM_AGENDA: 'siapepi_rtm_agenda',
  RTM_INVITEES: 'siapepi_rtm_invitees',
  RTM_DECISIONS: 'siapepi_rtm_decisions',
  RTM_NOTES: 'siapepi_rtm_notes',
  RTM_MINUTES: 'siapepi_rtm_minutes'
};

const RTMView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'schedule' | 'execution' | 'minutes'>('schedule');
  const [isGenerating, setIsGenerating] = useState(false);
  
  // -- Persistent State Hooks --
  const [meetingInfo, setMeetingInfo] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.RTM_INFO);
    return saved ? JSON.parse(saved) : {
      date: '2024-10-25', timeStart: '09:00', timeEnd: '12:00', location: 'R. Sidang Utama & Zoom', link: 'https://zoom.us/j/9821234912?pwd=pepi'
    };
  });

  const [agenda, setAgenda] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.RTM_AGENDA) || "1. Pemaparan Hasil Audit Mutu Internal Prodi Mekanisasi Pertanian.\n2. Pembahasan Temuan Major di Laboratorium Tata Air.\n3. Penetapan Kebijakan Mutu Baru terkait MBKM.";
  });

  const [invitees, setInvitees] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.RTM_INVITEES);
    return saved ? JSON.parse(saved) : [
      { id: 1, name: 'Dr. Ir. Harmanto, M.Eng', role: 'Direktur', status: 'hadir', mode: 'offline' },
      { id: 2, name: 'Dr. Andy Saryoko, SP, MP', role: 'Wadir I', status: 'hadir', mode: 'offline' },
      { id: 3, name: 'Ir. Athoillah Azadi, S.TP, MT', role: 'Wadir II', status: 'hadir', mode: 'offline' },
      { id: 4, name: 'Dr. Enrico S, STP, M.Si', role: 'Wadir III', status: 'hadir', mode: 'zoom' },
    ];
  });

  const [decisions, setDecisions] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.RTM_DECISIONS);
    return saved ? JSON.parse(saved) : [
      { id: 1, text: 'Menyetujui revisi sasaran mutu Prodi TMP.', checked: false },
      { id: 2, text: 'Jadwal Audit Susulan ditetapkan tgl 30 Okt.', checked: false }
    ];
  });

  const [rawNotes, setRawNotes] = useState(() => localStorage.getItem(STORAGE_KEYS.RTM_NOTES) || "");
  const [generatedMinutes, setGeneratedMinutes] = useState(() => localStorage.getItem(STORAGE_KEYS.RTM_MINUTES) || "");

  // -- Invitation Logic --
  const [selectedInvitees, setSelectedInvitees] = useState<number[]>([]);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [invitationDraft, setInvitationDraft] = useState('');
  const [isGeneratingInvite, setIsGeneratingInvite] = useState(false);

  // -- Auto-Save Side Effects --
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.RTM_INFO, JSON.stringify(meetingInfo)); }, [meetingInfo]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.RTM_AGENDA, agenda); }, [agenda]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.RTM_INVITEES, JSON.stringify(invitees)); }, [invitees]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.RTM_DECISIONS, JSON.stringify(decisions)); }, [decisions]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.RTM_NOTES, rawNotes); }, [rawNotes]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.RTM_MINUTES, generatedMinutes); }, [generatedMinutes]);

  const [newInvitee, setNewInvitee] = useState({ name: '', role: '' });

  const handleAddInvitee = () => {
    if(!newInvitee.name) return;
    setInvitees([...invitees, { id: Date.now(), name: newInvitee.name, role: newInvitee.role, status: 'pending', mode: '-' }]);
    setNewInvitee({ name: '', role: '' });
  };

  const toggleInviteeSelection = (id: number) => {
    setSelectedInvitees(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleSelectAll = () => {
    if (selectedInvitees.length === invitees.length) {
      setSelectedInvitees([]);
    } else {
      setSelectedInvitees(invitees.map((i: any) => i.id));
    }
  };

  const handleOpenInviteModal = async () => {
    if (selectedInvitees.length === 0) return alert("Pilih minimal satu peserta untuk dikirimi undangan.");
    setShowInviteModal(true);
    setIsGeneratingInvite(true);
    
    // Generate draft using AI
    const recipientLabel = selectedInvitees.length > 1 ? "Bapak/Ibu Pimpinan & Anggota" : invitees.find((i:any) => i.id === selectedInvitees[0])?.name || "Bapak/Ibu";
    const draft = await generateFormalInvitation(agenda, meetingInfo.date, `${meetingInfo.timeStart} - ${meetingInfo.timeEnd}`, meetingInfo.location, recipientLabel);
    
    setInvitationDraft(draft);
    setIsGeneratingInvite(false);
  };

  const handleSendInvitesFinal = () => {
    alert(`Undangan resmi telah dikirimkan via Email & WhatsApp Gateway ke ${selectedInvitees.length} peserta terpilih.`);
    setShowInviteModal(false);
    setSelectedInvitees([]);
  };

  const handleAddDecision = () => {
    const text = prompt("Masukkan butir keputusan rapat:");
    if(text) setDecisions([...decisions, { id: Date.now(), text, checked: false }]);
  };

  const handleGenerateAI = async () => {
    if (!rawNotes) return;
    setIsGenerating(true);
    const attendeesStr = invitees.filter((i:any) => i.status === 'hadir').map((i:any) => `${i.name} (${i.role})`).join(', ');
    const decisionStr = decisions.map((d:any) => `- ${d.text}`).join('\n');
    const result = await generateRTMMinutes(agenda, rawNotes + "\n\nKeputusan:\n" + decisionStr, attendeesStr);
    if (result) { setGeneratedMinutes(result); setActiveTab('minutes'); }
    setIsGenerating(false);
  };

  const toggleStatus = (id: number) => {
    setInvitees(invitees.map((inv:any) => {
      if (inv.id === id) {
        const nextStatus = inv.status === 'hadir' ? 'berhalangan' : inv.status === 'berhalangan' ? 'pending' : 'hadir';
        return { ...inv, status: nextStatus };
      }
      return inv;
    }));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Rapat Tinjauan Manajemen (RTM)</h2>
          <p className="text-sm text-slate-500 font-medium">Siklus Evaluasi Pengendalian Mutu • PEPI</p>
        </div>
        <div className="bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm flex">
          {[{ id: 'schedule', label: 'Jadwal', icon: Calendar }, { id: 'execution', label: 'Pelaksanaan', icon: Video }, { id: 'minutes', label: 'Berita Acara', icon: FileText }].map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wide transition-all ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}><tab.icon size={16} /><span className="hidden md:inline">{tab.label}</span></button>
          ))}
        </div>
      </div>

      {activeTab === 'schedule' && (
        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
          <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm relative overflow-hidden">
            <div className="relative z-10 flex flex-col lg:flex-row gap-8">
              <div className="flex-1 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl flex flex-col items-center justify-center font-bold border border-indigo-200"><span className="text-xs">Tgl</span><span className="text-2xl font-black">{meetingInfo.date.split('-')[2]}</span></div>
                  <div className="flex-1">
                    <h3 className="text-xl font-black text-slate-900">Rapat Pleno Tinjauan Manajemen</h3>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <div className="bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
                         <label className="text-[9px] font-bold text-slate-400 uppercase">Waktu</label>
                         <div className="flex gap-1 items-center"><input type="time" value={meetingInfo.timeStart} onChange={(e) => setMeetingInfo({...meetingInfo, timeStart: e.target.value})} className="bg-transparent text-sm font-bold text-slate-700 w-16 outline-none"/><span>-</span><input type="time" value={meetingInfo.timeEnd} onChange={(e) => setMeetingInfo({...meetingInfo, timeEnd: e.target.value})} className="bg-transparent text-sm font-bold text-slate-700 w-16 outline-none"/></div>
                      </div>
                      <div className="bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
                         <label className="text-[9px] font-bold text-slate-400 uppercase">Tempat</label>
                         <input type="text" value={meetingInfo.location} onChange={(e) => setMeetingInfo({...meetingInfo, location: e.target.value})} className="bg-transparent text-sm font-bold text-slate-700 w-full outline-none"/>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <span className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2"><Video size={14}/> Link Meeting</span>
                  <div className="flex gap-2"><input value={meetingInfo.link} onChange={(e) => setMeetingInfo({...meetingInfo, link: e.target.value})} className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono outline-none"/><a href={meetingInfo.link} target="_blank" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center">Buka</a></div>
                </div>
              </div>
              <div className="w-full lg:w-96 space-y-4">
                <h4 className="font-bold text-slate-800">Agenda Pembahasan</h4>
                <textarea className="w-full h-48 bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-medium outline-none resize-none" value={agenda} onChange={(e) => setAgenda(e.target.value)}/>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
              <h3 className="font-bold text-slate-900 text-lg">Undangan & Konfirmasi</h3>
              <div className="flex gap-2">
                 <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-xl border border-slate-100">
                    <input type="text" placeholder="Nama..." className="bg-transparent text-xs px-2 w-24 outline-none" value={newInvitee.name} onChange={(e) => setNewInvitee({...newInvitee, name: e.target.value})}/>
                    <button onClick={handleAddInvitee} className="p-1 bg-indigo-600 text-white rounded-lg"><Plus size={14} /></button>
                 </div>
                 <button 
                  onClick={handleOpenInviteModal}
                  disabled={selectedInvitees.length === 0}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-700 transition-all"
                 >
                   <Mail size={14} /> Buat Undangan ({selectedInvitees.length})
                 </button>
              </div>
            </div>

            <div className="mb-4">
              <button onClick={handleSelectAll} className="text-xs font-bold text-indigo-600 hover:text-indigo-800">
                {selectedInvitees.length === invitees.length ? 'Batalkan Semua' : 'Pilih Semua'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {invitees.map((person:any) => (
                <div key={person.id} className={`p-4 border rounded-2xl flex justify-between items-center transition-all ${selectedInvitees.includes(person.id) ? 'border-indigo-500 bg-indigo-50/50' : 'border-slate-200 bg-white'}`}>
                  <div className="flex items-center gap-3">
                    <input 
                      type="checkbox" 
                      checked={selectedInvitees.includes(person.id)}
                      onChange={() => toggleInviteeSelection(person.id)}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">{person.name.charAt(0)}</div>
                    <div><p className="font-bold text-slate-900 text-xs truncate max-w-[120px]">{person.name}</p><p className="text-[10px] text-slate-400">{person.role}</p></div>
                  </div>
                  <button onClick={() => toggleStatus(person.id)}>{person.status === 'hadir' ? <CheckCircle2 className="text-emerald-500" size={18} /> : <div className="w-4 h-4 rounded-full border-2 border-slate-200" />}</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL PREVIEW UNDANGAN */}
      {showInviteModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowInviteModal(false)} />
          <div className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-slate-50 px-8 py-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Mail size={20} className="text-indigo-600" />
                  Draft Undangan Resmi
                </h3>
                <p className="text-xs text-slate-500 font-medium">Generate by Gemini AI • Dikirim ke {selectedInvitees.length} Penerima</p>
              </div>
              <button onClick={() => setShowInviteModal(false)} className="p-2 hover:bg-slate-200 rounded-full"><X size={20} /></button>
            </div>
            
            <div className="p-8">
               {isGeneratingInvite ? (
                 <div className="h-64 flex flex-col items-center justify-center text-center space-y-4">
                    <Sparkles size={40} className="text-indigo-400 animate-pulse" />
                    <p className="text-sm font-bold text-slate-600">Sedang menyusun kalimat formal...</p>
                 </div>
               ) : (
                 <div className="space-y-4">
                    <div className="relative">
                      <textarea 
                        className="w-full h-80 p-6 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-serif leading-relaxed text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                        value={invitationDraft}
                        onChange={(e) => setInvitationDraft(e.target.value)}
                      />
                      <button 
                        onClick={() => navigator.clipboard.writeText(invitationDraft)}
                        className="absolute top-4 right-4 p-2 bg-white/50 hover:bg-white rounded-lg text-slate-500 hover:text-indigo-600 transition-all"
                        title="Salin Teks"
                      >
                        <Copy size={16} />
                      </button>
                    </div>
                    
                    <div className="flex gap-3">
                       <button onClick={handleOpenInviteModal} className="px-4 py-3 border border-slate-200 text-slate-600 font-bold rounded-xl text-xs hover:bg-slate-50 flex-1 flex items-center justify-center gap-2">
                         <Sparkles size={16} /> Regenerate AI
                       </button>
                       <button onClick={handleSendInvitesFinal} className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl text-xs shadow-lg hover:bg-indigo-700 flex-[2] flex items-center justify-center gap-2">
                         <Send size={16} /> Kirim Sekarang
                       </button>
                    </div>
                 </div>
               )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'execution' && (
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in slide-in-from-right-4 duration-300">
            <div className="lg:col-span-2 space-y-6">
               <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm">
                  <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-4"><PenTool size={18} /> Catatan Rapat</h3>
                  <textarea className="w-full h-96 p-6 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none resize-none" placeholder="Tulis poin diskusi..." value={rawNotes} onChange={(e) => setRawNotes(e.target.value)}/>
                  <div className="mt-4 flex justify-end">
                     <button onClick={handleGenerateAI} disabled={isGenerating || !rawNotes} className="px-6 py-3 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg flex items-center gap-2 disabled:opacity-50">
                        {isGenerating ? 'Memproses...' : <><Sparkles size={16} /> Generate BA via AI</>}
                     </button>
                  </div>
               </div>
            </div>
            <div className="space-y-6">
               <div className="bg-white border border-slate-200 p-6 rounded-[2rem] shadow-sm">
                  <h4 className="font-bold text-slate-800 text-sm uppercase mb-4">Keputusan Rapat</h4>
                  <div className="space-y-3 mb-4">
                     {decisions.map((d:any) => (
                       <div key={d.id} className="flex gap-2 p-2 bg-slate-50 rounded-lg">
                          <input type="text" value={d.text} onChange={(e) => setDecisions(decisions.map((dec:any) => dec.id === d.id ? {...dec, text: e.target.value} : dec))} className="bg-transparent text-xs w-full outline-none"/>
                       </div>
                     ))}
                     <button onClick={handleAddDecision} className="text-xs text-indigo-600 font-bold flex items-center gap-1"><Plus size={12} /> Tambah</button>
                  </div>
               </div>
            </div>
         </div>
      )}

      {activeTab === 'minutes' && (
        <div className="animate-in zoom-in-95 duration-500">
           <div className="max-w-4xl mx-auto bg-white shadow-2xl border border-slate-200 p-[2cm] relative min-h-[800px]">
              <div className="absolute top-4 right-4 flex gap-2 print:hidden">
                 <button onClick={() => window.print()} className="p-2 bg-slate-100 rounded-lg"><Printer size={18} /></button>
                 <button onClick={() => alert("BA Berhasil Disimpan")} className="p-2 bg-indigo-600 text-white rounded-lg"><Save size={18} /></button>
              </div>
              <div className="text-center border-b-4 border-double border-slate-900 pb-6 mb-8 flex items-center gap-4">
                  <img src="https://blogger.googleusercontent.com/img/a/AVvXsEhysFz6pmC2-xNbW1jhaglsdDlvAvTxcD3I8yZLAMPFjEaNKbbozDdMp_oaDCuh6QaOS173BQ-JDB6CY9u7yFI-JnhASDUnkkZB5Dz2iQwFZ-le5jYSJdI_4Fd6POTPSr47GatBUjBmpUB0iig7CAmtRZ_ZjTOzXpR7TvaFE6hyWorIq7tDEH6_UqXk=s600" alt="Logo" className="w-16 h-16 object-contain" />
                  <div className="text-left"><h1 className="text-lg font-black uppercase">Politeknik Enjiniring Pertanian Indonesia</h1><p className="text-[10px] font-bold text-slate-500 uppercase">Kementerian Pertanian</p></div>
              </div>
              <div className="prose prose-sm max-w-none text-justify font-serif">
                 {generatedMinutes ? <div dangerouslySetInnerHTML={{ __html: generatedMinutes.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} /> : <p className="text-slate-400 italic text-center py-10">Belum ada notulensi. Silakan generate via AI di tab Pelaksanaan.</p>}
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default RTMView;
