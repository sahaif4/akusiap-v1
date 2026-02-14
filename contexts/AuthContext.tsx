import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { User, Unit, CurrentUser, Role, BrandingConfig } from '../types';
import * as apiService from '../services/apiService';
import { ActivityLogItem } from '../types/dashboard';

interface AuthContextType {
  isAuthenticated: boolean;
  currentUser: CurrentUser | null;
  allUnits: Unit[];
  brandingConfig: BrandingConfig;
  login: (user: User, unit?: Unit) => void;
  logout: () => void;
  updateProfile: (updatedData: Partial<CurrentUser>) => void;
  updateBranding: (newConfig: BrandingConfig) => void;
  handleAuditorUnitChange: (newUnitCode: string) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const DEFAULT_BRANDING: BrandingConfig = {
  appName: 'SIAPEPI',
  appLogo: 'https://blogger.googleusercontent.com/img/a/AVvXsEhysFz6pmC2-xNbW1jhaglsdDlvAvTxcD3I8yZLAMPFjEaNKbbozDdMp_oaDCuh6QaOS173BQ-JDB6CY9u7yFI-JnhASDUnkkZB5Dz2iQwFZ-le5jYSJdI_4Fd6POTPSr47GatBUjBmpUB0iig7CAmtRZ_ZjTOzXpR7TvaFE6hyWorIq7tDEH6_UqXk=s600'
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [allUnits, setAllUnits] = useState<Unit[]>([]);
  const [brandingConfig, setBrandingConfig] = useState<BrandingConfig>(DEFAULT_BRANDING);

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('siapepi_current_user');
      if (savedUser) {
        const user: CurrentUser = JSON.parse(savedUser);
        setCurrentUser(user);
        setIsAuthenticated(true);
      }
      const savedBranding = localStorage.getItem('siapepi_branding_config');
      if (savedBranding) {
        setBrandingConfig(JSON.parse(savedBranding));
      }
    } catch (e) {
      console.error("Could not parse saved data from localStorage", e);
      localStorage.clear(); // Clear potentially corrupted storage
    }
  }, []);

  const fetchUnits = useCallback(async () => {
    if (isAuthenticated) {
      try {
        const units = await apiService.getUnits();
        setAllUnits(units);
        localStorage.setItem('siapepi_master_units', JSON.stringify(units)); 
      } catch (error) {
        console.error("Failed to fetch all units:", error);
      }
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchUnits();
  }, [fetchUnits]);

  const login = (user: User, unit?: Unit) => {
    const sessionData: CurrentUser = { id: user.id, name: user.nama, role: user.role, unitId: user.unit_id, unitName: unit?.nama_unit, unitCode: unit?.kode_unit, assignedUnits: user.assignedUnits };
    
    if (user.role === Role.AUDITOR && user.assignedUnits && user.assignedUnits.length > 0) {
      const lastSelected = localStorage.getItem(`auditor_active_unit_${user.id}`);
      const activeUnitCode = (lastSelected && user.assignedUnits.includes(lastSelected)) ? lastSelected : user.assignedUnits[0];
      sessionData.unitCode = activeUnitCode;
    }

    setCurrentUser(sessionData);
    setIsAuthenticated(true);
    localStorage.setItem('siapepi_current_user', JSON.stringify(sessionData));
    
    const newLog: ActivityLogItem = { id: Date.now(), user: user.nama, avatar: user.nama.charAt(0), action: 'masuk ke', target: 'Aplikasi SIAPEPI', timestamp: 'Baru saja' };
    const existingLogsRaw = localStorage.getItem('siapepi_activity_log');
    const existingLogs: ActivityLogItem[] = existingLogsRaw ? JSON.parse(existingLogsRaw) : [];
    const updatedLogs = [newLog, ...existingLogs].slice(0, 20);
    localStorage.setItem('siapepi_activity_log', JSON.stringify(updatedLogs));
  };

  const logout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    localStorage.removeItem('siapepi_current_user');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  };

  const updateProfile = (updatedData: Partial<CurrentUser>) => {
    setCurrentUser(prev => {
      const newUser = prev ? { ...prev, ...updatedData } : null;
      if (newUser) {
        localStorage.setItem('siapepi_current_user', JSON.stringify(newUser));
      }
      return newUser;
    });
  };

  const updateBranding = (newConfig: BrandingConfig) => {
    setBrandingConfig(newConfig);
    localStorage.setItem('siapepi_branding_config', JSON.stringify(newConfig));
  };

  const handleAuditorUnitChange = (newUnitCode: string) => {
    if (!currentUser || allUnits.length === 0) return;
    const unitDetails = allUnits.find(u => u.kode_unit === newUnitCode);
    if (unitDetails) {
        const updatedUser = { ...currentUser, unitId: unitDetails.id, unitName: unitDetails.nama_unit, unitCode: unitDetails.kode_unit };
        setCurrentUser(updatedUser);
        localStorage.setItem('siapepi_current_user', JSON.stringify(updatedUser));
        localStorage.setItem(`auditor_active_unit_${currentUser.id}`, newUnitCode);
    }
  };

  const value = { isAuthenticated, currentUser, allUnits, brandingConfig, login, logout, updateProfile, updateBranding, handleAuditorUnitChange };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
