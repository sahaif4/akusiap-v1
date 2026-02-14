import { GoogleGenAI, Type } from "@google/genai";
import { DashboardData } from "../types/dashboard";

// Initialize using process.env.API_KEY directly per guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateAuditSummary = async (findingsCount: number, majorCount: number, unitName: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Buatkan ringkasan eksekutif (1 paragraf) untuk laporan Audit Mutu Internal Unit ${unitName}. 
      Statistik: Total ${findingsCount} temuan, dengan ${majorCount} temuan Major. 
      Gunakan gaya bahasa formal akademik sesuai Permendiktisaintek 39/2025.`
    });
    // Access response.text as a property
    return response.text;
  } catch (error) {
    return "Gagal menghasilkan ringkasan otomatis.";
  }
};

export const generateRTMMinutes = async (agenda: string, rawNotes: string, attendees: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Bertindaklah sebagai Notulen Rapat profesional di Politeknik.
      Buatkan "Berita Acara Rapat Tinjauan Manajemen (RTM)" yang formal dan terstruktur berdasarkan input berikut:
      
      Agenda: ${agenda}
      Peserta Hadir: ${attendees}
      Catatan Mentah Jalannya Rapat: "${rawNotes}"

      Output yang diinginkan (Format Markdown):
      1. Judul & Tanggal (Gunakan tanggal hari ini).
      2. Ringkasan Pembahasan (Narasikan poin-poin diskusi menjadi kalimat formal).
      3. Keputusan Strategis / Tindak Lanjut (Buat daftar poin keputusan beserta penanggung jawab yang tersirat dari catatan).
      4. Penutup.
      
      Gunakan bahasa Indonesia baku yang sesuai untuk dokumen legal perguruan tinggi.`,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini RTM Error:", error);
    return "Gagal menghasilkan notulensi otomatis. Silakan coba lagi.";
  }
};

export const generateFormalInvitation = async (agenda: string, date: string, time: string, location: string, recipientName: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Buatkan draft pesan undangan resmi (WhatsApp/Email) untuk "Rapat Tinjauan Manajemen (RTM)" di Politeknik Enjiniring Pertanian Indonesia.
      
      Detail Acara:
      - Agenda: ${agenda}
      - Hari/Tanggal: ${date}
      - Waktu: ${time}
      - Tempat: ${location}
      - Kepada Yth: ${recipientName} (gunakan sebutan Bapak/Ibu yang sesuai jika umum, atau biarkan general).

      Gunakan bahasa Indonesia yang sangat formal, sopan, dan persuasif. 
      Struktur:
      1. Salam Pembuka
      2. Isi Undangan (Mengingat pentingnya acara ini, dimohon kehadirannya)
      3. Detail Waktu & Tempat
      4. Penutup.
      
      Output hanya teks undangan saja tanpa markdown berlebih.`
    });
    return response.text;
  } catch (error) {
    return "Mohon maaf, gagal membuat draft undangan otomatis.";
  }
};

export const generateAuditInstruments = async (standardName: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Bertindaklah sebagai Auditor Mutu Internal Perguruan Tinggi Vokasi.
      Buatkan 3 (tiga) butir pertanyaan instrumen audit (IKU/IKT) beserta bukti wajib (evidence) untuk standar berikut: "${standardName}".
      
      Pastikan pertanyaan relevan dengan konteks Politeknik/Vokasi.
      Format output wajib JSON Array:
      [
        { "q": "Pertanyaan audit...", "proof": "Dokumen bukti..." },
        ...
      ]`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              q: { type: Type.STRING },
              proof: { type: Type.STRING }
            },
            required: ["q", "proof"]
          }
        }
      }
    });
    return JSON.parse(response.text || '[]');
  } catch (error) {
    console.error("Gemini Instrument Error:", error);
    return [];
  }
};

// NEW: Generates planning recommendations based on historical data
export const generatePlanningRecommendations = async (analysisSummary: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview", // Use a more powerful model for analysis
      contents: `Anda adalah seorang Kepala Unit Penjaminan Mutu (UPM) yang berpengalaman.
      Berdasarkan ringkasan analisis tren audit historis berikut, berikan rekomendasi strategis untuk perencanaan audit siklus berikutnya.

      Analisis Data Historis:
      ---
      ${analysisSummary}
      ---

      Berikan output dalam format JSON dengan struktur berikut:
      1. "focus_areas": Array string berisi nama standar yang menjadi prioritas utama (contoh: ["Standar Pendidikan", "Standar Penelitian"]).
      2. "recommendations": String berisi narasi rekomendasi umum dalam satu paragraf.
      3. "suggested_questions": Array objek, di mana setiap objek berisi "standard" (kode standar, e.g., "STD-06") dan "question" (satu pertanyaan audit tambahan yang lebih mendalam/investigatif untuk area yang lemah).
      4. "auditor_notes": String berisi catatan advisory terkait penugasan atau kalibrasi auditor jika ada indikasi konflik/inkonsistensi.
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            focus_areas: { type: Type.ARRAY, items: { type: Type.STRING } },
            recommendations: { type: Type.STRING },
            suggested_questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  standard: { type: Type.STRING },
                  question: { type: Type.STRING }
                },
                required: ["standard", "question"]
              }
            },
            auditor_notes: { type: Type.STRING }
          },
          required: ["focus_areas", "recommendations", "suggested_questions", "auditor_notes"]
        }
      }
    });
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Gemini Planning Recommendation Error:", error);
    return null;
  }
};


export const generateDashboardNarrative = async (data: DashboardData, criteriaDefs: Record<string, string>) => {
  if (!data || !data.radar || data.radar.length === 0) {
    return "Data tidak cukup untuk menghasilkan analisis.";
  }
  try {
    const lowestCriteria = data.radar.reduce((min, p) => p.score < min.score ? p : min, data.radar[0]);
    const highestCriteria = data.radar.reduce((max, p) => p.score > max.score ? p : max, data.radar[0]);

    const status = data.stats.average_score >= 3.5 ? 'Sangat Baik' : data.stats.average_score >= 3.0 ? 'Baik' : 'Perlu Perbaikan';

    const prompt = `Buat ringkasan eksekutif satu kalimat untuk dasbor penjaminan mutu berdasarkan data berikut.
Status: ${status} (skor rata-rata ${data.stats.average_score.toFixed(2)}).
Kriteria terkuat: ${criteriaDefs[highestCriteria.criteria]} (skor ${highestCriteria.score}).
Kriteria terlemah: ${criteriaDefs[lowestCriteria.criteria]} (skor ${lowestCriteria.score}).
Narasikan seperti contoh: "Kinerja mutu secara keseluruhan berada pada level 'Baik', dengan kekuatan utama pada Pendidikan, namun area Penelitian memerlukan perhatian lebih lanjut."
Gunakan Bahasa Indonesia formal dan jangan gunakan markdown.`;
      
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt
    });
    
    return response.text;
  } catch (error) {
    console.error("Narrative Generation Error:", error);
    return "Analisis kinerja mutu sedang diproses...";
  }
};
