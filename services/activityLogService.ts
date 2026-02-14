import { ActivityLogItem } from "../types/dashboard";

const STORAGE_KEY = 'siapepi_activity_log';

/**
 * Fetches the latest activity log from localStorage.
 */
export const getActivityLog = async (): Promise<ActivityLogItem[]> => {
  console.log("SERVICE: Reading activity log from localStorage.");
  try {
    const rawLogs = localStorage.getItem(STORAGE_KEY);
    if (rawLogs) {
      const logs: ActivityLogItem[] = JSON.parse(rawLogs);
      // Simple time formatting for display
      const now = Date.now();
      return logs.map(log => {
        if (log.timestamp === 'Baru saja') {
            const timeDiff = now - log.id; // Using ID as timestamp
            if (timeDiff > 60000) { // More than a minute ago
                const minutes = Math.floor(timeDiff / 60000);
                if (minutes >= 60) {
                    const hours = Math.round(minutes / 60);
                    return { ...log, timestamp: `${hours} jam lalu`};
                }
                return { ...log, timestamp: `${minutes}m lalu`};
            }
        }
        return log;
      });
    }
    return [];
  } catch(e) {
    console.error("Failed to fetch activity log from localStorage:", e);
    return [];
  }
};