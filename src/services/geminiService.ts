
import { GoogleGenAI, Type } from "@google/genai";

// Initialize using process.env.API_KEY directly per guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeFinding = async (uraianTemuan: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analisis temuan audit berikut: "${uraianTemuan}". 
      Berikan rekomendasi "Akar Masalah" (Root Cause) dan "Tindakan Koreksi" (Corrective Action) yang sesuai dengan standar penjaminan mutu pendidikan tinggi. 
      Format jawaban dalam JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            akar_masalah: { type: Type.STRING },
            tindakan_koreksi: { type: Type.STRING },
            level_risiko: { type: Type.STRING, description: "rendah, sedang, atau tinggi" }
          },
          required: ["akar_masalah", "tindakan_koreksi", "level_risiko"]
        }
      }
    });
    // Access response.text as a property, not a method
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Gemini Error:", error);
    return null;
  }
};

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
