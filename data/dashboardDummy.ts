import { DashboardData, UnitCode } from "../types/dashboard";

export const dashboardDummyData: Record<UnitCode, DashboardData> = {
  TMP: {
    radar: [
      { criteria: "K1", score: 3.5 }, { criteria: "K2", score: 3.2 },
      { criteria: "K3", score: 3.8 }, { criteria: "K4", score: 3.6 },
      { criteria: "K5", score: 3.4 }, { criteria: "K6", score: 3.7 },
      { criteria: "K7", score: 3.1 }, { criteria: "K8", score: 3.0 },
      { criteria: "K9", score: 3.9 },
    ],
    trends: [
      { period: "2021", findings: 12 }, { period: "2022", findings: 8 },
      { period: "2023", findings: 5 }, { period: "2024", findings: 4 },
    ],
    composition: [
      { name: "Patuh", value: 75, color: '#10b981' },
      { name: "Patuh Bersyarat", value: 20, color: '#f59e0b' },
      { name: "Tidak Patuh", value: 5, color: '#ef4444' },
    ],
    stats: { average_score: 3.56, total_findings: 4, major_findings: 1, minor_findings: 3 },
  },
  THP: {
    radar: [
      { criteria: "K1", score: 3.8 }, { criteria: "K2", score: 3.5 },
      { criteria: "K3", score: 3.9 }, { criteria: "K4", score: 3.3 },
      { criteria: "K5", score: 3.7 }, { criteria: "K6", score: 3.8 },
      { criteria: "K7", score: 3.4 }, { criteria: "K8", score: 3.2 },
      { criteria: "K9", score: 4.0 },
    ],
    trends: [
      { period: "2021", findings: 10 }, { period: "2022", findings: 9 },
      { period: "2023", findings: 6 }, { period: "2024", findings: 2 },
    ],
    composition: [
      { name: "Patuh", value: 85, color: '#10b981' },
      { name: "Patuh Bersyarat", value: 10, color: '#f59e0b' },
      { name: "Tidak Patuh", value: 5, color: '#ef4444' },
    ],
    stats: { average_score: 3.72, total_findings: 2, major_findings: 0, minor_findings: 2 },
  },
  TAP: {
    radar: [
      { criteria: "K1", score: 3.1 }, { criteria: "K2", score: 2.8 },
      { criteria: "K3", score: 3.3 }, { criteria: "K4", score: 3.0 },
      { criteria: "K5", score: 3.5 }, { criteria: "K6", score: 2.9 },
      { criteria: "K7", score: 2.5 }, { criteria: "K8", score: 2.7 },
      { criteria: "K9", score: 3.2 },
    ],
    trends: [
      { period: "2021", findings: 15 }, { period: "2022", findings: 18 },
      { period: "2023", findings: 11 }, { period: "2024", findings: 9 },
    ],
    composition: [
      { name: "Patuh", value: 55, color: '#10b981' },
      { name: "Patuh Bersyarat", value: 30, color: '#f59e0b' },
      { name: "Tidak Patuh", value: 15, color: '#ef4444' },
    ],
    stats: { average_score: 3.0, total_findings: 9, major_findings: 3, minor_findings: 6 },
  },
  UPPS: {
    radar: [
      { criteria: "K1", score: 4.0 }, { criteria: "K2", score: 3.8 },
      { criteria: "K3", score: 3.5 }, { criteria: "K4", score: 3.9 },
      { criteria: "K5", score: 3.8 }, { criteria: "K6", score: 3.7 },
      { criteria: "K7", score: 3.6 }, { criteria: "K8", score: 3.5 },
      { criteria: "K9", score: 3.9 },
    ],
    trends: [
      { period: "2021", findings: 5 }, { period: "2022", findings: 3 },
      { period: "2023", findings: 2 }, { period: "2024", findings: 1 },
    ],
    composition: [
      { name: "Patuh", value: 90, color: '#10b981' },
      { name: "Patuh Bersyarat", value: 8, color: '#f59e0b' },
      { name: "Tidak Patuh", value: 2, color: '#ef4444' },
    ],
    stats: { average_score: 3.79, total_findings: 1, major_findings: 0, minor_findings: 1 },
  },
  UPPM: {
    radar: [
      { criteria: "K1", score: 3.2 }, { criteria: "K2", score: 3.1 },
      { criteria: "K3", score: 3.0 }, { criteria: "K4", score: 2.8 },
      { criteria: "K5", score: 3.3 }, { criteria: "K6", score: 3.4 },
      { criteria: "K7", score: 3.8 }, { criteria: "K8", score: 3.9 },
      { criteria: "K9", score: 3.5 },
    ],
    trends: [
      { period: "2021", findings: 8 }, { period: "2022", findings: 6 },
      { period: "2023", findings: 7 }, { period: "2024", findings: 5 },
    ],
    composition: [
      { name: "Patuh", value: 65, color: '#10b981' },
      { name: "Patuh Bersyarat", value: 25, color: '#f59e0b' },
      { name: "Tidak Patuh", value: 10, color: '#ef4444' },
    ],
    stats: { average_score: 3.33, total_findings: 5, major_findings: 2, minor_findings: 3 },
  },
};