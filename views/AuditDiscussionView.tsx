
import React, { useState, useEffect } from 'react';
import { MessageSquareText, Search, Send, Paperclip, MoreVertical, CheckCheck, User, Building2, Plus, X, ChevronDown, Check, Clock } from 'lucide-react';
import { Role, ChatTopic, ChatMessage, ChatStatus } from '../types';

const STORAGE_KEYS = { CHATS: 'siapepi_discussion_data_v2' }; // New storage key to avoid conflicts

// MOCK DATA: Simulating users for recipient dropdown
const MOCK_USERS = [
    { id: 10, name: 'Irwanto (Auditor 1)', role: Role.AUDITOR },
    { id: 12, name: 'Dr. Mardison (Auditor 2)', role: Role.AUDITOR },
    { id: 3, name: 'Mas Wisnu (Admin UPM)', role: Role.ADMIN_UPM }
];
const CURRENT_USER = { id: 20, name: 'Dyah Ayu (Admin Prodi)', role: Role.ADMIN_PRODI };

const INITIAL_CHATS: ChatTopic[] = [
  {
    id: 1, title: 'Klarifikasi Temuan: Rasio Dosen', unit: 'Prodi Teknologi Mekanisasi Pertanian', 
    lastMessage: 'Baik, kami akan kirimkan data segera.', unreadCount: 1, updatedAt: '10:30 AM',
    status: ChatStatus.RESPONDED, category: 'Klarifikasi Temuan', linkedTo: 'Temuan #1 / STD-04',
    participants: [CURRENT_USER, MOCK_USERS[1]],
    messages: [
      { id: 1, senderName: 'Dr. Mardison (Auditor)', senderRole: Role.AUDITOR, message: 'Mohon konfirmasi data dosen tetap untuk tahun ajaran 2023/2024. Data di LED tampak belum sesuai dengan PDDIKTI.', timestamp: '09:00 AM', isSelf: false },
      { id: 2, senderName: `Anda (${CURRENT_USER.role})`, senderRole: Role.ADMIN_PRODI, message: 'Baik, Pak. Kami sedang siapkan rekapitulasi data terbaru dari SDM. Akan segera kami kirimkan.', timestamp: '09:05 AM', isSelf: true }
    ]
  },
  { 
    id: 2, title: 'Revisi Dokumen Renstra', unit: 'Prodi Teknologi Mekanisasi Pertanian', 
    lastMessage: 'File revisi sudah diunggah.', unreadCount: 0, updatedAt: 'Kemarin',
    status: ChatStatus.CLOSED, category: 'Perbaikan Dokumen', linkedTo: 'Instrumen #5 / STD-01',
    participants: [CURRENT_USER, MOCK_USERS[0]],
    messages: [] 
  },
  { 
    id: 3, title: 'Sanggahan Skor Butir 6.a', unit: 'Prodi Teknologi Mekanisasi Pertanian', 
    lastMessage: 'Mohon pertimbangannya kembali, Pak.', unreadCount: 0, updatedAt: '2 hari lalu',
    status: ChatStatus.OPEN, category: 'Sanggahan Skor', linkedTo: 'Instrumen #12 / STD-06',
    participants: [CURRENT_USER, MOCK_USERS[1]],
    messages: [] 
  }
];

const getStatusChip = (status: ChatStatus) => {
    switch(status) {
        case ChatStatus.OPEN: return 'bg-amber-100 text-amber-700';
        case ChatStatus.RESPONDED: return 'bg-blue-100 text-blue-700';
        case ChatStatus.CLOSED: return 'bg-emerald-100 text-emerald-700';
        default: return 'bg-slate-100 text-slate-600';
    }
};

const NewDiscussionModal: React.FC<{ onClose: () => void, onCreate: (topic: any) => void }> = ({ onClose, onCreate }) => {
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('Klarifikasi Temuan');
    const [recipient, setRecipient] = useState(MOCK_USERS[0].id);
    const [message, setMessage] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const recipientUser = MOCK_USERS.find(u => u.id === recipient);
        if(!title || !message || !recipientUser) return;
        
        const newTopicData = {
            title,
            category,
            recipient: recipientUser,
            message
        };
        onCreate(newTopicData);
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
            <form onSubmit={handleSubmit} className="relative bg-white w-full max-w-2xl rounded-[2rem] p-8 shadow-2xl animate-in zoom-in-95 duration-200 space-y-6">
                <div className="flex justify-between items-center"><h3 className="text-xl font-bold">Buat Topik Diskusi Baru</h3><button type="button" onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full"><X size={20}/></button></div>
                <div><label className="text-xs font-bold text-slate-500">Judul Topik</label><input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full border p-3 rounded-lg mt-1 text-sm font-bold" required /></div>
                <div className="grid grid-cols-2 gap-4">
                    <div><label className="text-xs font-bold text-slate-500">Kategori</label><select value={category} onChange={e => setCategory(e.target.value)} className="w-full border p-3 rounded-lg mt-1 text-sm"><option>Klarifikasi Temuan</option><option>Perbaikan Dokumen</option><option>Sanggahan Skor</option><option>Lainnya</option></select></div>
                    <div><label className="text-xs font-bold text-slate-500">Tujukan Kepada</label><select value={recipient} onChange={e => setRecipient(Number(e.target.value))} className="w-full border p-3 rounded-lg mt-1 text-sm">{MOCK_USERS.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}</select></div>
                </div>
                <div><label className="text-xs font-bold text-slate-500">Pesan Pertama</label><textarea value={message} onChange={e => setMessage(e.target.value)} rows={4} className="w-full border p-3 rounded-lg mt-1 text-sm" required /></div>
                <button type="submit" className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700">Mulai Diskusi</button>
            </form>
        </div>
    );
};

const AuditDiscussionView: React.FC = () => {
  const [chats, setChats] = useState<ChatTopic[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CHATS);
    return saved ? JSON.parse(saved) : INITIAL_CHATS;
  });

  const [activeTopicId, setActiveTopicId] = useState<number>(1);
  const [inputMessage, setInputMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => { localStorage.setItem(STORAGE_KEYS.CHATS, JSON.stringify(chats)); }, [chats]);

  const activeChat = chats.find(c => c.id === activeTopicId);

  const handleCreateTopic = (data: any) => {
    const newTopic: ChatTopic = {
        id: Date.now(),
        title: data.title,
        unit: 'Prodi Teknologi Mekanisasi Pertanian',
        lastMessage: data.message,
        unreadCount: 0,
        updatedAt: 'Baru saja',
        status: ChatStatus.OPEN,
        category: data.category as any,
        participants: [CURRENT_USER, data.recipient],
        messages: [{
            id: Date.now(),
            senderName: `Anda (${CURRENT_USER.role})`,
            senderRole: CURRENT_USER.role,
            message: data.message,
            timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
            isSelf: true
        }]
    };
    setChats(prev => [newTopic, ...prev]);
    setActiveTopicId(newTopic.id);
    setIsModalOpen(false);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !activeChat) return;

    const newMessage: ChatMessage = {
      id: Date.now(),
      senderName: `Anda (${CURRENT_USER.role})`,
      senderRole: CURRENT_USER.role,
      message: inputMessage,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      isSelf: true
    };

    setChats(prev => prev.map(chat => chat.id === activeTopicId ? { ...chat, messages: [...chat.messages, newMessage], lastMessage: inputMessage, updatedAt: 'Baru saja', status: ChatStatus.RESPONDED } : chat));
    setInputMessage('');
  };

  const handleStatusChange = (newStatus: ChatStatus) => {
    setChats(prev => prev.map(chat => chat.id === activeTopicId ? { ...chat, status: newStatus } : chat));
  };

  return (
    <>
      <div className="h-[calc(100vh-140px)] flex flex-col md:flex-row gap-6 animate-in fade-in duration-500">
        <div className="w-full md:w-96 flex flex-col bg-white border border-slate-200 rounded-[2.5rem] shadow-sm overflow-hidden flex-shrink-0">
          <div className="p-6 border-b bg-slate-50/50 space-y-4">
            <h3 className="font-black text-slate-900 text-lg flex items-center gap-2"><MessageSquareText className="text-indigo-600" /> Diskusi AMI</h3>
            <button onClick={() => setIsModalOpen(true)} className="w-full py-3 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-lg hover:bg-indigo-700 flex items-center justify-center gap-2"><Plus size={16}/> Buat Topik Diskusi</button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {chats.map(chat => (
              <div key={chat.id} onClick={() => setActiveTopicId(chat.id)} className={`p-4 rounded-2xl cursor-pointer transition-all ${activeTopicId === chat.id ? 'bg-indigo-600 text-white shadow-lg' : 'hover:bg-slate-50 text-slate-600'}`}>
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-sm truncate pr-4">{chat.title}</h4>
                  {chat.unreadCount > 0 && <span className="bg-rose-500 text-white text-[9px] font-bold w-5 h-5 flex items-center justify-center rounded-full">{chat.unreadCount}</span>}
                </div>
                <p className={`text-xs truncate mt-1 ${activeTopicId === chat.id ? 'text-indigo-100' : 'text-slate-400'}`}>{chat.lastMessage}</p>
                <div className="mt-2 flex items-center justify-between">
                    <span className={`px-2 py-0.5 text-[9px] font-bold rounded border ${activeTopicId === chat.id ? 'bg-white/10 border-white/20' : getStatusChip(chat.status)}`}>{chat.status}</span>
                    <span className={`text-[9px] font-bold ${activeTopicId === chat.id ? 'text-indigo-200' : 'text-slate-400'}`}>{chat.updatedAt}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 flex flex-col bg-white border border-slate-200 rounded-[2.5rem] shadow-sm overflow-hidden">
          {activeChat ? (
            <>
              <div className="p-4 border-b bg-slate-50/50 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold border border-indigo-200"><Building2 size={20}/></div>
                  <div>
                    <h4 className="font-bold text-slate-800">{activeChat.title}</h4>
                    {activeChat.linkedTo && <a href="#" className="text-[10px] text-indigo-600 font-bold uppercase hover:underline">{activeChat.linkedTo}</a>}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <button className={`flex items-center gap-2 px-3 py-1 text-xs font-bold rounded-lg border ${getStatusChip(activeChat.status)}`}>
                            {activeChat.status} <ChevronDown size={14}/>
                        </button>
                        <div className="absolute top-full right-0 mt-2 w-48 bg-white shadow-lg rounded-lg border p-1 z-10 hidden group-hover:block">
                            {Object.values(ChatStatus).map(s => <button key={s} onClick={() => handleStatusChange(s)} className="w-full text-left px-3 py-1.5 text-xs hover:bg-slate-100 rounded">{s}</button>)}
                        </div>
                    </div>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/20">
                {activeChat.messages.map((msg) => (
                  <div key={msg.id} className={`flex gap-3 items-end ${msg.isSelf ? 'justify-end' : 'justify-start'}`}>
                    {!msg.isSelf && <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-xs text-slate-500 flex-shrink-0">{msg.senderName.charAt(0)}</div>}
                    <div className={`p-4 rounded-3xl text-sm max-w-[70%] shadow-sm ${msg.isSelf ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white border border-slate-200 text-slate-700 rounded-bl-none'}`}>
                        {!msg.isSelf && <p className="text-[10px] font-bold text-indigo-600">{msg.senderName} ({msg.senderRole})</p>}
                        <p className="mt-1 leading-relaxed">{msg.message}</p>
                        <p className={`text-[9px] mt-2 ${msg.isSelf ? 'text-indigo-200 text-right' : 'text-slate-400'}`}>{msg.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 bg-white border-t border-slate-100">
                <form onSubmit={handleSendMessage} className="flex gap-3">
                  <input type="text" value={inputMessage} onChange={(e) => setInputMessage(e.target.value)} placeholder="Tulis balasan..." className="flex-1 bg-slate-50 border border-slate-200 p-4 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
                  <button type="submit" disabled={!inputMessage.trim()} className="w-14 h-14 flex items-center justify-center bg-indigo-600 text-white rounded-2xl shadow-lg hover:bg-indigo-700 disabled:opacity-50 transition-all"><Send size={20} /></button>
                </form>
              </div>
            </>
          ) : <div className="flex-1 flex items-center justify-center text-slate-400 italic">Pilih atau buat topik untuk memulai diskusi.</div>}
        </div>
      </div>
      {isModalOpen && <NewDiscussionModal onClose={() => setIsModalOpen(false)} onCreate={handleCreateTopic} />}
    </>
  );
};

export default AuditDiscussionView;
