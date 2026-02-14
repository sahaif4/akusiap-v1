
import React, { useState } from 'react';
import { 
  Terminal, 
  Play, 
  Database, 
  Cpu, 
  Layers, 
  Copy, 
  Network,
  Info,
  CheckCircle2,
  ClipboardList
} from 'lucide-react';

const BackendPreviewView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'install' | 'models' | 'serializers' | 'views' | 'urls' | 'seedSql'>('install');

  const codeSnippets = {
    install: `# === LANGKAH INSTALASI LOCALHOST (LARAGON) ===

# 1. PERSIAPAN DATABASE
# - Jalankan Laragon (Start All)
# - Buka phpMyAdmin / HeidiSQL
# - Buat database baru bernama: db_siapepi

# 2. PERSIAPAN FOLDER (Terminal / PowerShell)
# - Klik kanan di folder project Bapak, pilih "Open PowerShell"
# - Buat & Aktifkan Virtual Environment:
python -m venv venv
.\\venv\\Scripts\\activate

# 3. INSTALL LIBRARY PENDUKUNG
pip install django djangorestframework django-cors-headers mysqlclient google-genai

# 4. MIGRASI KE MYSQL LARAGON
# (Langkah ini akan otomatis membuat tabel di database Bapak)
python manage.py makemigrations
python manage.py migrate

# 5. JALANKAN SERVER
python manage.py runserver

# === SELESAI ===
# Akses aplikasi di: http://127.0.0.1:8000`,

    models: `# audit_app/models.py
from django.db import models

class Unit(models.Model):
    nama_unit = models.CharField(max_length=255)
    kode_unit = models.CharField(max_length=10, unique=True)
    jenis_unit = models.CharField(max_length=20) # prodi/pendukung

class Instrument(models.Model):
    kode = models.CharField(max_length=50)
    pertanyaan = models.TextField()
    bobot = models.IntegerField(default=1)
    doc_status = models.CharField(max_length=50, default='Belum Diunggah')

class Finding(models.Model):
    uraian = models.TextField()
    akar_masalah = models.TextField(blank=True, null=True)
    tindakan_koreksi = models.TextField(blank=True, null=True)
    level_risiko = models.CharField(max_length=20) # tinggi/sedang/rendah`,

    serializers: `# audit_app/serializers.py
from rest_framework import serializers
from .models import Unit, Instrument, Finding

class UnitSerializer(serializers.ModelSerializer):
    class Meta:
        model = Unit
        fields = '__all__'

class FindingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Finding
        fields = '__all__'`,

    views: `# audit_app/views.py
import os
from google import genai
from rest_framework import viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Finding, Unit
from .serializers import FindingSerializer, UnitSerializer

class FindingViewSet(viewsets.ModelViewSet):
    queryset = Finding.objects.all()
    serializer_class = FindingSerializer

@api_view(['POST'])
def ai_analyze_finding(request):
    uraian = request.data.get('uraian')
    
    # BEST PRACTICE: Ambil API Key dari Environment Server (file .env)
    # Jangan menaruh key langsung di kodingan agar aman
    client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))
    
    prompt = f"Analisis akar masalah & tindakan koreksi untuk temuan audit: {uraian}"
    
    # Panggil Model Gemini Flash (Cepat & Hemat)
    response = client.models.generate_content(
        model='gemini-3-flash-preview', 
        contents=prompt
    )
    
    return Response({"analysis": response.text})`,

    urls: `# audit_app/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FindingViewSet, ai_analyze_finding

router = DefaultRouter()
router.register(r'findings', FindingViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('analyze-ai/', ai_analyze_finding),
]`,
    seedSql: `/*
 🔐 ASUMSI TABEL
 audit_questions
 (id, kriteria_lam, indikator_lam, kode_pertanyaan, pertanyaan, aspek_ppepp)
*/

-- 🟦 K1 – VISI, MISI, TUJUAN, STRATEGI (VMTS)
INSERT INTO audit_questions (kriteria_lam, indikator_lam, kode_pertanyaan, pertanyaan, aspek_ppepp) VALUES
('K1','K1.a','1.1','Apakah program studi memiliki kebijakan tertulis tentang visi, misi, tujuan, dan strategi (VMTS)?','Penetapan'),
('K1','K1.a','1.2','Apakah VMTS program studi selaras dengan VMTS UPPS dan Perguruan Tinggi?','Penetapan'),
('K1','K1.b','1.3','Apakah pencapaian VMTS didukung oleh SDM, sarana prasarana, dan pendanaan yang memadai?','Pelaksanaan'),
('K1','K1.b','1.4','Apakah strategi pencapaian VMTS dirumuskan secara terukur dan realistis?','Pelaksanaan'),
('K1','K1.c','1.5','Apakah dilakukan evaluasi VMTS dan tindak lanjut hasil evaluasi tersebut?','Evaluasi');

-- 🟦 K2 – TATA PAMONG, TATA KELOLA, KERJASAMA
INSERT INTO audit_questions (kriteria_lam, indikator_lam, kode_pertanyaan, pertanyaan, aspek_ppepp) VALUES
('K2','K2.a','2.1','Apakah struktur organisasi dan tata pamong program studi terdokumentasi dengan jelas?','Penetapan'),
('K2','K2.a','2.2','Apakah tugas dan fungsi setiap unit kerja ditetapkan secara tertulis?','Penetapan'),
('K2','K2.b','2.3','Apakah mekanisme pengambilan keputusan berjalan efektif dan transparan?','Pelaksanaan'),
('K2','K2.b','2.4','Apakah dilakukan monitoring dan evaluasi tata pamong secara berkala?','Evaluasi'),
('K2','K2.c','2.5','Apakah program studi memiliki kerjasama tridharma yang relevan dan aktif?','Pelaksanaan'),
('K2','K2.d','2.6','Apakah hasil kerjasama dimonitor, dievaluasi, dan dimanfaatkan?','Pengendalian');

-- 🟦 K3 – MAHASISWA
INSERT INTO audit_questions (kriteria_lam, indikator_lam, kode_pertanyaan, pertanyaan, aspek_ppepp) VALUES
('K3','K3.a','3.1','Apakah kebijakan penerimaan mahasiswa baru terdokumentasi dan dilaksanakan secara konsisten?','Penetapan'),
('K3','K3.a','3.2','Apakah seleksi mahasiswa dilakukan secara objektif dan transparan?','Pelaksanaan'),
('K3','K3.a','3.3','Apakah terdapat analisis daya tampung dan rasio dosen–mahasiswa?','Evaluasi'),
('K3','K3.b','3.4','Apakah program studi menyediakan layanan akademik dan non-akademik bagi mahasiswa?','Pelaksanaan'),
('K3','K3.c','3.5','Apakah kepuasan mahasiswa dan keberhasilan studi diukur dan ditindaklanjuti?','Pengendalian');

-- 🟦 K4 – SUMBER DAYA MANUSIA
INSERT INTO audit_questions (kriteria_lam, indikator_lam, kode_pertanyaan, pertanyaan, aspek_ppepp) VALUES
('K4','K4.a','4.1','Apakah jumlah dosen tetap memenuhi kebutuhan program studi?','Penetapan'),
('K4','K4.b','4.2','Apakah kualifikasi akademik dan jabatan dosen sesuai standar?','Pelaksanaan'),
('K4','K4.c','4.3','Apakah dosen mengikuti kegiatan pengembangan kompetensi secara berkelanjutan?','Pengendalian'),
('K4','K4.d','4.4','Apakah jumlah dan kompetensi tenaga kependidikan mencukupi?','Pelaksanaan');

-- 🟦 K5 – KEUANGAN, SARANA, PRASARANA
INSERT INTO audit_questions (kriteria_lam, indikator_lam, kode_pertanyaan, pertanyaan, aspek_ppepp) VALUES
('K5','K5.a','5.1','Apakah pengelolaan keuangan program studi dilakukan secara transparan dan akuntabel?','Pelaksanaan'),
('K5','K5.a','5.2','Apakah alokasi anggaran mendukung pencapaian VMTS?','Evaluasi'),
('K5','K5.b','5.3','Apakah sarana dan prasarana pembelajaran mencukupi dan relevan?','Pelaksanaan'),
('K5','K5.b','5.4','Apakah dilakukan pemeliharaan dan pengembangan sarana prasarana secara berkelanjutan?','Pengendalian');

-- 🟦 K6 – PENDIDIKAN
INSERT INTO audit_questions (kriteria_lam, indikator_lam, kode_pertanyaan, pertanyaan, aspek_ppepp) VALUES
('K6','K6.a','6.1','Apakah kurikulum program studi dirancang berbasis OBE?','Penetapan'),
('K6','K6.b','6.2','Apakah CPL, OPL, dan CPMK selaras dan terdokumentasi?','Penetapan'),
('K6','K6.c','6.3','Apakah kurikulum dievaluasi dan ditinjau secara berkala?','Evaluasi'),
('K6','K6.d','6.4','Apakah RPS tersedia dan digunakan dalam proses pembelajaran?','Pelaksanaan'),
('K6','K6.d','6.5','Apakah proses pembelajaran berpusat pada mahasiswa (student-centered learning)?','Pelaksanaan');

-- 🟦 K7 – PENELITIAN
INSERT INTO audit_questions (kriteria_lam, indikator_lam, kode_pertanyaan, pertanyaan, aspek_ppepp) VALUES
('K7','K7.a','7.1','Apakah program studi memiliki roadmap penelitian yang jelas dan relevan?','Penetapan'),
('K7','K7.b','7.2','Apakah penelitian dosen melibatkan mahasiswa?','Pelaksanaan'),
('K7','K7.c','7.3','Apakah hasil penelitian dipublikasikan dan dimanfaatkan?','Pengendalian');

-- 🟦 K8 – PKM
INSERT INTO audit_questions (kriteria_lam, indikator_lam, kode_pertanyaan, pertanyaan, aspek_ppepp) VALUES
('K8','K8.a','8.1','Apakah program studi memiliki roadmap pengabdian kepada masyarakat (PKM)?','Penetapan'),
('K8','K8.b','8.2','Apakah kegiatan PKM berdampak bagi masyarakat dan mendukung VMTS?','Pelaksanaan'),
('K8','K8.c','8.3','Apakah mahasiswa dilibatkan dalam kegiatan PKM?','Pengendalian');

-- 🟦 K9 – LUARAN & CAPAIAN
INSERT INTO audit_questions (kriteria_lam, indikator_lam, kode_pertanyaan, pertanyaan, aspek_ppepp) VALUES
('K9','K9.a','9.1','Apakah lulusan terserap di dunia kerja sesuai bidang keilmuan?','Evaluasi'),
('K9','K9.b','9.2','Apakah masa tunggu lulusan berada pada kategori baik?','Evaluasi'),
('K9','K9.c','9.3','Apakah kepuasan pengguna lulusan diukur dan ditindaklanjuti?','Pengendalian');`
  };

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-500">
      <div className="bg-slate-900 text-white p-10 rounded-[3rem] shadow-2xl relative overflow-hidden border border-slate-800">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] -mr-20 -mt-20"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="space-y-4">
             <div className="flex items-center gap-3">
                <div className="p-3 bg-indigo-600 rounded-2xl"><Terminal size={24}/></div>
                <h2 className="text-3xl font-black uppercase tracking-tighter">Desain & Arsitektur Backend</h2>
             </div>
             <p className="text-slate-400 text-sm max-w-xl font-medium leading-relaxed">
               Rancangan model data, API endpoint, dan contoh data seed untuk SIAPI.
             </p>
          </div>
          <div className="bg-emerald-500/10 border border-emerald-500/20 p-5 rounded-3xl text-center">
             <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Status Kompatibilitas</p>
             <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <CheckCircle2 size={16}/> MySQL & Python Verified
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-1 space-y-2">
           {[
             { id: 'install', label: 'Panduan Jalan', icon: Play },
             { id: 'models', label: 'models.py', icon: Database },
             { id: 'serializers', label: 'serializers.py', icon: Layers },
             { id: 'views', label: 'views.py', icon: Cpu },
             { id: 'urls', label: 'urls.py', icon: Network },
             { id: 'seedSql', label: 'Bank Data (SQL)', icon: ClipboardList }
           ].map((item: any) => (
             <button 
               key={item.id}
               onClick={() => setActiveTab(item.id)}
               className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                 activeTab === item.id 
                   ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200' 
                   : 'bg-white text-slate-500 hover:bg-slate-100 border border-slate-200'
               }`}
             >
               <item.icon size={16} />
               {item.label}
             </button>
           ))}
        </div>

        <div className="lg:col-span-4 space-y-4">
           <div className="bg-slate-900 rounded-[2.5rem] border border-slate-800 shadow-2xl overflow-hidden">
              <div className="px-8 py-4 bg-slate-900 border-b border-slate-800 flex justify-between items-center">
                 <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                    <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                 </div>
                 <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">
                    {activeTab === 'install' ? 'Langkah Berurutan' : activeTab === 'seedSql' ? 'SQL Seed Data' : activeTab + '.py'}
                 </div>
                 <button 
                  onClick={() => {
                    navigator.clipboard.writeText(codeSnippets[activeTab as keyof typeof codeSnippets]);
                    alert("Kode berhasil disalin!");
                  }}
                  className="text-xs font-bold text-indigo-400 hover:text-white transition-all flex items-center gap-2"
                 >
                   <Copy size={14}/> COPY CODE
                 </button>
              </div>
              <div className="p-8 overflow-x-auto">
                 <pre className="text-emerald-400 font-mono text-xs leading-relaxed">
                    {codeSnippets[activeTab as keyof typeof codeSnippets]}
                 </pre>
              </div>
           </div>

           <div className="p-6 bg-white border border-slate-200 rounded-3xl flex items-start gap-4 shadow-sm">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-xl"><Info size={20}/></div>
              <div>
                <h4 className="text-xs font-black text-slate-900 uppercase">Catatan Keamanan (Penting):</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed mt-1">
                  Untuk implementasi di server hosting/lokal, pastikan API Key tidak ditulis langsung di file <code>views.py</code>. Gunakan library <code>python-dotenv</code> dan simpan key di file <code>.env</code> agar aman dari akses tidak sah.
                </p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default BackendPreviewView;
