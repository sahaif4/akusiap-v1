
import { Instrument, ComplianceStatus } from '../types';

/**
 * Menghitung status kepatuhan berdasarkan skor numerik.
 * Batas skor (skala 0-4):
 * - >= 3.5: Patuh
 * - >= 2.5: Patuh Bersyarat
 * - < 2.5: Tidak Patuh
 * @param score Skor numerik dari sebuah instrumen atau skor rata-rata.
 * @returns Status kepatuhan yang dihitung.
 */
export const calculateComplianceStatus = (score: number): ComplianceStatus => {
  if (score >= 3.5) {
    return ComplianceStatus.PATUH;
  }
  if (score >= 2.5) {
    return ComplianceStatus.PATUH_BERSYARAT;
  }
  return ComplianceStatus.TIDAK_PATUH;
};

/**
 * Menghitung skor rata-rata sederhana dari daftar instrumen.
 * Memprioritaskan skor audit akhir ('skor'), dan beralih ke skor evaluasi meja ('final_desk_score') jika tidak ada.
 * Instrumen tanpa skor yang valid diabaikan dalam perhitungan.
 * @param instruments Array objek Instrumen.
 * @returns Skor rata-rata sebagai angka. Mengembalikan 0 jika tidak ada instrumen yang memiliki skor.
 */
export const calculateAverageScore = (instruments: Instrument[]): number => {
  const scoredInstruments = instruments.filter(inst =>
    (inst.skor !== undefined && inst.skor !== null) ||
    (inst.final_desk_score !== undefined && inst.final_desk_score !== null)
  );

  if (scoredInstruments.length === 0) {
    return 0;
  }

  const totalScore = scoredInstruments.reduce((acc, inst) => {
    const score = inst.skor ?? inst.final_desk_score ?? 0;
    return acc + score;
  }, 0);

  return totalScore / scoredInstruments.length;
};

/**
 * Menghitung skor rata-rata tertimbang dari daftar instrumen.
 * Skor setiap instrumen dikalikan dengan bobotnya ('bobot'). Instrumen tanpa
 * bobot yang ditentukan diasumsikan memiliki bobot 1.
 * @param instruments Array objek Instrumen, yang mungkin memiliki properti 'bobot' opsional.
 * @returns Skor rata-rata tertimbang. Mengembalikan 0 jika tidak ada instrumen yang memiliki skor.
 */
export const calculateWeightedScore = (instruments: Instrument[]): number => {
  const scoredInstruments = instruments.filter(inst =>
    (inst.skor !== undefined && inst.skor !== null) ||
    (inst.final_desk_score !== undefined && inst.final_desk_score !== null)
  );

  if (scoredInstruments.length === 0) {
    return 0;
  }

  let totalWeightedScore = 0;
  let totalWeight = 0;

  scoredInstruments.forEach(inst => {
    const score = inst.skor ?? inst.final_desk_score ?? 0;
    const weight = inst.bobot ?? 1; // Bobot default adalah 1
    
    totalWeightedScore += score * weight;
    totalWeight += weight;
  });

  if (totalWeight === 0) {
    return 0; // Menghindari pembagian dengan nol
  }

  return totalWeightedScore / totalWeight;
};

/**
 * Menganalisis distribusi status kepatuhan untuk daftar instrumen.
 * @param instruments Array objek Instrumen.
 * @returns Objek yang berisi jumlah untuk setiap status kepatuhan dan jumlah total.
 */
export const analyzeScoreDistribution = (instruments: Instrument[]): {
  patuh: number;
  patuhBersyarat: number;
  tidakPatuh: number;
  total: number;
} => {
  const distribution = {
    patuh: 0,
    patuhBersyarat: 0,
    tidakPatuh: 0,
  };

  const scoredInstruments = instruments.filter(inst =>
    (inst.skor !== undefined && inst.skor !== null) ||
    (inst.final_desk_score !== undefined && inst.final_desk_score !== null)
  );

  scoredInstruments.forEach(inst => {
    const score = inst.skor ?? inst.final_desk_score ?? 0;
    const status = calculateComplianceStatus(score);
    switch (status) {
      case ComplianceStatus.PATUH:
        distribution.patuh++;
        break;
      case ComplianceStatus.PATUH_BERSYARAT:
        distribution.patuhBersyarat++;
        break;
      case ComplianceStatus.TIDAK_PATUH:
        distribution.tidakPatuh++;
        break;
    }
  });

  return { ...distribution, total: scoredInstruments.length };
};
