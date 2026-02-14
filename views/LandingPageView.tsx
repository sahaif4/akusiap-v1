
import React, { useEffect, useState, useRef } from 'react';
import { 
  ShieldCheck, Award, ArrowRight, Tractor, Cpu, Zap, CheckCircle2, Scale, BarChart3, UserCog, Briefcase, UserCheck, GraduationCap, GanttChart, FileUp, ClipboardCheck, MessageSquareText, PenSquare, Users, CheckCircle, Database, Server
} from 'lucide-react';
import { HeroSlide, BrandingConfig } from '../types';

interface LandingPageViewProps {
  onLoginClick: () => void;
  slides: HeroSlide[];
  brandingConfig: BrandingConfig;
}

const LandingPageView: React.FC<LandingPageViewProps> = ({ onLoginClick, slides, brandingConfig }) => {
  const [scrolled, setScrolled] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeRoleTab, setActiveRoleTab] = useState(0);
  const proposalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (slides.length === 0) return;
    const slideInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(slideInterval);
  }, [slides]);

  const scrollToProposal = () => {
    proposalRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const ROLE_DETAILS = [
    {
      title: "Super Admin",
      subtitle: "Penjaga Ekosistem Digital",
      icon: Database,
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop",
      desc: "Memegang kendali penuh atas infrastruktur data dan manajemen pengguna.",
      features: [
        "Manajemen Master Data (User, Unit, Prodi)",
        "Backup & Restore Database Berkala",
        "Konfigurasi Global Siklus Audit",
        "Monitoring Aktivitas Sistem (Log)"
      ]
    },
    {
      title: "Admin UPM",
      subtitle: "Arsitek Penjaminan Mutu",
      icon: Briefcase,
      image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=2070&auto=format&fit=crop",
      desc: "Bertanggung jawab merancang jadwal, standar, dan menugaskan auditor kompeten.",
      features: [
        "Pembuatan Jadwal Audit Tahunan",
        "Upload SK & Surat Tugas Auditor",
        "Distribusi Standar SPMI Terbaru",
        "Monitoring Dashboard Kepatuhan Global"
      ]
    },
    {
      title: "Auditor",
      subtitle: "Evaluator Objektif & Cerdas",
      icon: ShieldCheck,
      image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=2072&auto=format&fit=crop",
      desc: "Melakukan penilaian lapangan dan memberikan rekomendasi perbaikan berbasis bukti.",
      features: [
        "Penyusunan Checklist (Desk Evaluation)",
        "Scoring Real-time & Catatan Temuan",
        "Analisis Akar Masalah dengan AI",
        "Penerbitan Berita Acara Digital"
      ]
    },
    {
      title: "Admin Prodi (Auditee)",
      subtitle: "Pelaksana Budaya Mutu",
      icon: GraduationCap,
      image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2070&auto=format&fit=crop",
      desc: "Ujung tombak pelaporan data kinerja dan tindak lanjut perbaikan.",
      features: [
        "Input Data Profil LED (Laporan Evaluasi Diri)",
        "Unggah Dokumen Bukti Dukung",
        "Diskusi & Klarifikasi Temuan (Chat)",
        "Pelaksanaan Rencana Tindak Lanjut (RTL)"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-pepi-green-900 selection:text-white">
      {/* Navbar */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm py-4' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src={brandingConfig.appLogo} alt="Logo PEPI" className="w-10 h-10 object-contain" />
            <div>
              <h1 className={`font-bold text-xl tracking-tight leading-none ${scrolled ? 'text-slate-900' : 'text-white'}`}>{brandingConfig.appName}</h1>
              <p className={`text-[10px] font-medium tracking-widest uppercase ${scrolled ? 'text-slate-500' : 'text-pepi-green-200'}`}>Digital Quality Assurance</p>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
             <button onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} className={`text-xs font-black uppercase tracking-widest ${scrolled ? 'text-slate-600 hover:text-pepi-green-900' : 'text-white/80 hover:text-white'}`}>Beranda</button>
             <button onClick={scrollToProposal} className={`text-xs font-black uppercase tracking-widest ${scrolled ? 'text-slate-600 hover:text-pepi-green-900' : 'text-white/80 hover:text-white'}`}>Proposal Strategis</button>
             <button onClick={onLoginClick} className={`px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all ${scrolled ? 'bg-slate-900 text-white hover:bg-pepi-green-900' : 'bg-white text-slate-900 hover:bg-pepi-green-50'}`}>Login Portal</button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative h-screen flex items-center justify-center overflow-hidden bg-slate-900">
        {slides.map((slide, index) => (
          <div key={slide.id} className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}>
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('${slide.image}')` }}></div>
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-slate-900/30"></div>
          </div>
        ))}

        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center mt-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-pepi-green-300 text-[10px] font-black uppercase tracking-[0.2em] mb-6 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Zap size={14} className="fill-pepi-green-300" /> Transformasi Audit Digital 4.0
          </div>
          <h1 className="text-4xl md:text-7xl font-black text-white tracking-tighter leading-[0.9] mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
             {slides[currentSlide]?.title}
          </h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto mb-12 font-medium leading-relaxed opacity-90">
             {slides[currentSlide]?.subtitle}
          </p>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
            <button onClick={onLoginClick} className="px-10 py-5 bg-pepi-green-900 hover:bg-pepi-green-800 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-pepi-green-900/50 transition-all flex items-center gap-3">
              Mulai Audit Sekarang <ArrowRight size={18} />
            </button>
            <button onClick={scrollToProposal} className="px-10 py-5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-2xl font-black text-xs uppercase tracking-widest backdrop-blur-md transition-all">
              Lihat Proposal Aplikasi
            </button>
          </div>
        </div>
      </header>

      {/* PROPOSAL STRATEGIS SECTION */}
      <section ref={proposalRef} className="py-32 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 space-y-24">
          
          {/* Executive Summary */}
          <div className="text-center max-w-4xl mx-auto">
             <span className="text-pepi-green-900 font-black uppercase tracking-[0.3em] text-[10px] block mb-4">Executive Summary</span>
             <h2 className="text-4xl lg:text-5xl font-black text-slate-900 leading-tight mb-6">Proposal Strategis Implementasi {brandingConfig.appName}</h2>
             <p className="text-slate-500 leading-relaxed font-medium text-lg">
               Ekosistem penjaminan mutu digital yang dirancang khusus untuk memenuhi standar terbaru <strong className="text-pepi-green-900">Permendiktisaintek No. 39 Tahun 2025</strong>.
             </p>
             <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all"><Scale className="text-emerald-500 mb-2" /> <h4 className="font-bold text-sm">Regulasi 2025</h4> <p className="text-xs text-slate-500">Kepatuhan penuh Permendiktisaintek No. 39/2025.</p></div>
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all"><Award className="text-pepi-green-500 mb-2" /> <h4 className="font-bold text-sm">Standar LAM-PTIP</h4> <p className="text-xs text-slate-500">Matriks khusus prodi Teknik & Pertanian.</p></div>
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all"><Cpu className="text-pepi-warning-700 mb-2" /> <h4 className="font-bold text-sm">AI Integrated</h4> <p className="text-xs text-slate-500">Analisis temuan dan notulensi RTM otomatis.</p></div>
             </div>
          </div>

          {/* ROLE SPOTLIGHT WITH IMAGES */}
          <div>
            <div className="text-center max-w-2xl mx-auto mb-12">
               <h3 className="text-3xl font-black text-slate-900">Arsitektur Peran Terintegrasi</h3>
               <p className="text-slate-500 mt-2">Sistem membagi tugas secara spesifik untuk memastikan akuntabilitas di setiap level pengguna.</p>
            </div>
            
            <div className="bg-white rounded-[3rem] shadow-xl border border-slate-100 overflow-hidden">
               <div className="grid grid-cols-1 lg:grid-cols-12">
                  {/* Left: Menu */}
                  <div className="lg:col-span-4 bg-slate-50 p-4 lg:p-8 space-y-2 border-r border-slate-100">
                     {ROLE_DETAILS.map((role, idx) => (
                        <button 
                           key={idx}
                           onClick={() => setActiveRoleTab(idx)}
                           className={`w-full text-left p-6 rounded-[2rem] transition-all duration-300 flex items-center gap-4 group ${
                              activeRoleTab === idx ? 'bg-white shadow-lg ring-1 ring-slate-100 scale-100' : 'hover:bg-white/50 scale-95 opacity-70 hover:opacity-100'
                           }`}
                        >
                           <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${activeRoleTab === idx ? 'bg-pepi-green-900 text-white' : 'bg-slate-200 text-slate-500'}`}>
                              <role.icon size={20} />
                           </div>
                           <div>
                              <h4 className={`font-bold text-sm ${activeRoleTab === idx ? 'text-slate-900' : 'text-slate-500'}`}>{role.title}</h4>
                              <p className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">{role.subtitle}</p>
                           </div>
                        </button>
                     ))}
                  </div>

                  {/* Right: Content Preview */}
                  <div className="lg:col-span-8 p-8 lg:p-12 relative overflow-hidden">
                     {ROLE_DETAILS.map((role, idx) => (
                        <div key={idx} className={`transition-all duration-500 ease-out ${activeRoleTab === idx ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10 absolute inset-0 pointer-events-none'}`}>
                           {activeRoleTab === idx && (
                              <div className="h-full flex flex-col">
                                 <div className="relative h-64 w-full rounded-[2.5rem] overflow-hidden mb-8 shadow-2xl group">
                                    <div className="absolute inset-0 bg-pepi-green-900/20 group-hover:bg-pepi-green-900/10 transition-colors z-10"></div>
                                    <img src={role.image} alt={role.title} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" />
                                    <div className="absolute bottom-6 left-6 z-20">
                                       <span className="px-4 py-2 bg-white/90 backdrop-blur rounded-xl text-xs font-black uppercase tracking-widest text-slate-900">Tampilan Dashboard</span>
                                    </div>
                                 </div>
                                 
                                 <div className="space-y-6">
                                    <div>
                                       <h3 className="text-2xl font-black text-slate-900 mb-2">{role.title}</h3>
                                       <p className="text-slate-500 font-medium leading-relaxed">{role.desc}</p>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                       {role.features.map((feat, fIdx) => (
                                          <div key={fIdx} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                                             <CheckCircle2 className="text-emerald-500 flex-shrink-0" size={18} />
                                             <span className="text-xs font-bold text-slate-700">{feat}</span>
                                          </div>
                                       ))}
                                    </div>
                                 </div>
                              </div>
                           )}
                        </div>
                     ))}
                  </div>
               </div>
            </div>
          </div>
          
          {/* Detailed Workflow */}
          <div>
            <div className="text-center max-w-3xl mx-auto mb-16">
               <h3 className="text-3xl font-black text-slate-900">Mekanisme Alur Kerja Audit (PPEPP)</h3>
               <p className="text-slate-500 mt-2">Implementasi siklus Penjaminan Mutu secara digital, mulai dari Penetapan hingga Peningkatan.</p>
            </div>
            
            <div className="relative flex flex-col gap-12 ml-6">
              <div className="absolute left-6 top-0 bottom-0 w-1 bg-slate-200" />
              
              {[
                { icon: GanttChart, title: 'Setup Siklus (Penetapan)', actor: 'Admin UPM', details: 'Membuat jadwal audit tahunan, mengunggah SK Penugasan Auditor, dan memastikan Standar SPMI terbaru tersedia di repositori digital.' },
                { icon: UserCheck, title: 'Perencanaan Audit (Pelaksanaan)', actor: 'Auditor', details: 'Auditor yang ditugaskan menyusun instrumen audit (Checklist) spesifik berdasarkan standar yang akan diaudit.' },
                { icon: FileUp, title: 'Penyediaan Dokumen (Pelaksanaan)', actor: 'Auditee (Prodi)', details: 'Prodi menerima notifikasi instrumen dan mengunggah dokumen bukti (Evidence) serta mengisi Laporan Evaluasi Diri (LED).' },
                { icon: ClipboardCheck, title: 'Audit Kecukupan & Lapangan (Evaluasi)', actor: 'Auditor', details: 'Auditor melakukan Desk Evaluation dan Visitasi Lapangan, memberikan skor kepatuhan, dan mencatat temuan.' },
                { icon: MessageSquareText, title: 'Klarifikasi & Sanggahan (Pengendalian)', actor: 'Auditor & Auditee', details: 'Auditee dapat memberikan sanggahan atas temuan melalui fitur chat real-time sebelum status temuan difinalisasi.' },
                { icon: PenSquare, title: 'Finalisasi Berita Acara', actor: 'Auditor & Auditee', details: 'Penandatanganan digital Berita Acara Hasil Audit yang menyepakati skor dan temuan (Major/Minor/Observasi).' },
                { icon: Users, title: 'Rapat Tinjauan Manajemen (RTM)', actor: 'Pimpinan & UPM', details: 'Pembahasan hasil audit di tingkat pimpinan. Sistem otomatis men-generate notulensi rapat dan daftar hadir.' },
                { icon: CheckCircle, title: 'Pengesahan RTL (Peningkatan)', actor: 'Direktur', details: 'Rencana Tindak Lanjut (RTL) disahkan sebagai komitmen perbaikan mutu untuk siklus berikutnya.' }
              ].map((step, idx) => (
                <div key={idx} className="relative z-10 flex items-start gap-8">
                  <div className="w-12 h-12 rounded-full flex-shrink-0 bg-pepi-green-900 text-white flex items-center justify-center border-4 border-slate-50 shadow-md">
                    <step.icon size={24} />
                  </div>
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 flex-1 shadow-sm hover:shadow-xl transition-shadow group">
                    <p className="text-[10px] font-black text-pepi-green-900 uppercase tracking-widest mb-2 group-hover:text-pepi-green-800">Langkah {idx + 1} • Pelaku: {step.actor}</p>
                    <h4 className="text-lg font-bold text-slate-800 mb-2">{step.title}</h4>
                    <p className="text-sm text-slate-500 leading-relaxed">{step.details}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Final Call to Action */}
          <div className="bg-slate-900 rounded-[3rem] p-12 text-white relative overflow-hidden shadow-2xl">
             <div className="absolute top-0 right-0 w-64 h-64 bg-pepi-green-500/20 rounded-full blur-[80px] -mr-20 -mt-20"></div>
             <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                <div>
                   <h4 className="text-2xl font-black mb-2">Siap untuk Presentasi?</h4>
                   <p className="text-slate-400 text-sm max-w-md font-medium">Platform ini adalah investasi strategis untuk budaya mutu PEPI yang unggul dan berkelanjutan.</p>
                </div>
                <button onClick={onLoginClick} className="px-10 py-5 bg-white text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-emerald-50 transition-all">
                   Eksplorasi Dashboard
                </button>
             </div>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
             <img src={brandingConfig.appLogo} alt="Logo PEPI" className="w-8 h-8 rounded-lg object-contain bg-white p-1" />
             <span className="text-white font-bold tracking-tight">{brandingConfig.appName} Digital Ecosystem</span>
          </div>
          <p className="text-[10px] font-bold uppercase tracking-widest">© {new Date().getFullYear()} Unit Penjaminan Mutu PEPI</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPageView;