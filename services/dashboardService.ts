import { DashboardData, UnitCode } from "../types/dashboard";
import { CurrentUser } from '../types';
import { getDashboardData as getDashboardDataFromApi } from './apiService';

export async function getDashboardData(
  unit: UnitCode,
  user: CurrentUser | null
): Promise<DashboardData> {
  if (!user) {
    throw new Error("Authentication error: User context is missing.");
  }
  
  try {
    const data = await getDashboardDataFromApi(unit, user);
    if (data) {
      return data;
    }
    throw new Error("Data dashboard tidak tersedia dari backend.");
  } catch (error) {
    console.error("Dashboard Service Error:", error);
    // Re-throw the error so the UI can handle it
    throw error as Error;
  }
}