import { HistoricalCycle, DocumentStatus } from '../types';

// Dummy data for cross-cycle analysis
export const historicalData: HistoricalCycle[] = [
  {
    cycleName: "AMI 2023 Genap",
    instruments: [
      { 
        id: 202301, standard: 'STD-06', unit_target: 'Prodi Teknologi Mekanisasi Pertanian', pertanyaan: 'Apakah RPS sesuai standar OBE?', bukti_wajib: 'RPS',
        doc_file: 'RPS_TMP_2023.pdf', auditor_ids: [10, 12] as [number, number], conflict: true,
        evaluations: {
          '10': { status: DocumentStatus.APPROVED, skor_desk: 3, isComplete: true, catatan_desk: 'Cukup baik, tapi perlu perbaikan di rubrik.' },
          '12': { status: DocumentStatus.APPROVED, skor_desk: 2, isComplete: true, catatan_desk: 'Rubrik penilaian belum memenuhi standar OBE.' }
        }
      },
      { 
        id: 202302, standard: 'STD-04', unit_target: 'Prodi Teknologi Mekanisasi Pertanian', pertanyaan: 'Apakah rasio dosen dan mahasiswa memadai?', bukti_wajib: 'Data PDDIKTI',
        doc_file: 'Rasio_Dosen_TMP_2023.pdf', auditor_ids: [10, 12] as [number, number], conflict: false,
        evaluations: {
          '10': { status: DocumentStatus.APPROVED, skor_desk: 4, isComplete: true, catatan_desk: 'Sesuai standar.' },
          '12': { status: DocumentStatus.APPROVED, skor_desk: 4, isComplete: true, catatan_desk: 'Memenuhi.' }
        }
      },
    ]
  },
  {
    cycleName: "AMI 2024 Ganjil",
    instruments: [
        { 
            id: 202401, standard: 'STD-06', unit_target: 'Prodi Teknologi Mekanisasi Pertanian', pertanyaan: 'Apakah RPS sesuai standar OBE?', bukti_wajib: 'RPS',
            doc_file: 'RPS_TMP_2024.pdf', auditor_ids: [10, 12] as [number, number], conflict: false,
            evaluations: {
              '10': { status: DocumentStatus.APPROVED, skor_desk: 4, isComplete: true, catatan_desk: 'Sudah ada perbaikan signifikan pada rubrik.' },
              '12': { status: DocumentStatus.APPROVED, skor_desk: 4, isComplete: true, catatan_desk: 'Sesuai dengan rekomendasi sebelumnya.' }
            }
        },
        { 
            id: 202402, standard: 'STD-07', unit_target: 'Prodi Teknologi Mekanisasi Pertanian', pertanyaan: 'Apakah roadmap penelitian selaras dengan VMTS?', bukti_wajib: 'Roadmap Penelitian',
            doc_file: 'Roadmap_TMP_2024.pdf', auditor_ids: [10, 12] as [number, number], conflict: false,
            evaluations: {
              '10': { status: DocumentStatus.APPROVED, skor_desk: 3, isComplete: true, catatan_desk: 'Cukup selaras.' },
              '12': { status: DocumentStatus.APPROVED, skor_desk: 3, isComplete: true, catatan_desk: 'Perlu ditinjau kembali tahun depan.' }
            }
        },
    ]
  }
];