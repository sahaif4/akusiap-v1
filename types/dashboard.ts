export type UnitCode = "TMP" | "THP" | "TAP" | "UPPS" | "UPPM";

export interface RadarScore {
  criteria: string;
  score: number;
}

export interface TrendPoint {
  period: string;
  findings: number;
}

export interface PieSegment {
  name: string;
  value: number;
  color: string;
  [key: string]: any;
}

export interface Stats {
  average_score: number;
  total_findings: number;
  major_findings: number;
  minor_findings: number;
}

export interface DashboardData {
  radar: RadarScore[];
  trends: TrendPoint[];
  composition: PieSegment[];
  stats: Stats;
}

export interface ActivityLogItem {
  id: number;
  user: string;
  avatar: string; // User's initial
  action: string;
  target: string;
  timestamp: string;
}