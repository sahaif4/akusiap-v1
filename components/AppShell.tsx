import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, AlertCircle, Settings, ChevronRight, Database, Search, User as UserIcon, FileCode, UploadCloud, ClipboardList, Eye, BarChart3, Briefcase, Users, LogOut, GanttChart, Building2, MessageSquareText, ChevronDown, FileCheck2, TrendingUp, PanelLeftClose, PanelLeftOpen, Presentation, UserCog
} from 'lucide-react';
import { Role, CurrentUser } from '../types';
import { useAuth } from '../contexts/AuthContext';
import * as apiService from '../services/apiService';

// Components
import SidebarItem from './SidebarItem';
import DashboardView from '../views/DashboardView';
import MasterDataView from '../views/MasterDataView';
import AuditExecutionView from '../views/AuditExecutionView';
import FindingsView from '../views/FindingsView';
import BackendPreviewView from '../views/BackendPreviewView';
import AuditeeSubmissionView from '../views/AuditeeSubmissionView';
import DeskEvaluationView from '../views/DeskEvaluationView';
import AuditPlanningView from '../views/AuditPlanningView';
import AuditTimelineView from '../views/AuditTimelineView';
import UPMManagementDashboardView from '../views/UPMManagementDashboardView';
import UPMAdminView from '../views/UPMAdminView';
import UPMStructureView from '../views/UPMStructureView';
import RTMView from '../views/RTMView';
import SettingsView from '../views/SettingsView';
import ProdiProfileView from '../views/ProdiProfileView';
import AuditDiscussionView from '../views/AuditDiscussionView';
import AdminWorkflowView from '../views/AdminWorkflowView';
import AuditorTrendView from '../views/AuditorTrendView';
import ProfilePortfolioView from '../views/ProfilePortfolioView';
import ApiContractView from '../views/ApiContractView';

const AppShell: React.FC = () => {
  const { currentUser, allUnits, logout, handleAuditorUnitChange, updateProfile, brandingConfig } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => localStorage.getItem('sidebarCollapsed') === 'true');
  const [auditStatus, setAuditStatus] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      if (currentUser?.unitName) {
        try {
          const status = await apiService.getAuditStatus(currentUser.unitName);
          setAuditStatus(status.status);
        } catch (e) {
          console.error("Gagal mengambil status audit", e);
        }
      }
    };
    fetchStatus();
    // Refresh status occasionally
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, [currentUser?.unitName]);

  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', String(isSidebarCollapsed));
  }, [isSidebarCollapsed]);

  const userRole = currentUser?.role || Role.AUDITEE;
  const isSuperAdmin = userRole === Role.SUPER_ADMIN;
  const isAdminUPM = userRole === Role.ADMIN_UPM;
  const isAdminProdi = userRole === Role.ADMIN_PRODI;
  const isAuditor = [Role.SUPER_ADMIN, Role.AUDITOR].includes(userRole);
  const isAuditee = [Role.ADMIN_PRODI, Role.AUDITEE, Role.KAPRODI].includes(userRole);
  const isManagement = [Role.PIMPINAN, Role.WADIR, Role.KAPRODI].includes(userRole);
  const isKaprodi = userRole === Role.KAPRODI;
  const canAccessUserManagement = isSuperAdmin;
  const canAccessUnitManagement = isSuperAdmin || isAdminUPM;
  const canAccessUPMTools = isSuperAdmin || isAdminUPM;
  const canAccessSubmission = isAdminProdi || userRole === Role.AUDITEE || isAdminUPM || isSuperAdmin;
  const canAccessRTM = [Role.SUPER_ADMIN, Role.ADMIN_UPM, Role.PIMPINAN, Role.WADIR, Role.KAPRODI, Role.AUDITOR].includes(userRole);
  const canAccessSettings = isSuperAdmin || isAdminUPM;
  const canAccessProdiProfile = isAdminProdi || isKaprodi || isAuditor || isManagement || isSuperAdmin;
  const canAccessDiscussion = isAdminProdi || isAuditor || isSuperAdmin || isAdminUPM;
  const canAccessAdminWorkflow = isAuditor || isAuditee || isAdminUPM || isSuperAdmin;
  const canAccessTrendAnalysis = isSuperAdmin || isAdminUPM;
  
  const handleNavigate = (tab: string) => {
    setActiveTab(tab);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <DashboardView currentUser={currentUser} />;
      case 'profile-portfolio': return <ProfilePortfolioView currentUser={currentUser} onProfileUpdate={updateProfile} />;
      case 'planning': return isAuditor ? <AuditPlanningView onNavigate={handleNavigate} /> : <DashboardView currentUser={currentUser} />;
      case 'timeline': return <AuditTimelineView currentUser={currentUser} />;
      case 'submission': {
        const fallbackUnitName = currentUser?.unitName || allUnits.find(u => u.id === currentUser?.unitId)?.nama_unit;
        return canAccessSubmission ? <AuditeeSubmissionView userUnit={fallbackUnitName} /> : <DashboardView currentUser={currentUser} />;
      }
      case 'audit-ami': {
        const fallbackUnitName = currentUser?.unitName || allUnits.find(u => u.id === currentUser?.unitId)?.nama_unit;
        return (isAuditee && auditStatus === 'FIELD_AUDIT') ? <AuditExecutionView userUnit={fallbackUnitName} isAuditeeView={true} /> : <DashboardView currentUser={currentUser} />;
      }
      case 'desk-eval': return isAuditor ? <DeskEvaluationView currentUser={currentUser} /> : <DashboardView currentUser={currentUser} />;
      case 'execution': return isAuditor ? <AuditExecutionView /> : <DashboardView currentUser={currentUser} />;
      case 'admin-workflow': return canAccessAdminWorkflow ? <AdminWorkflowView currentUser={currentUser}/> : <DashboardView currentUser={currentUser} />;
      case 'findings': return <FindingsView currentUser={currentUser} />;
      case 'discussion': return canAccessDiscussion ? <AuditDiscussionView /> : <DashboardView currentUser={currentUser} />;
      case 'rtm': return canAccessRTM ? <RTMView /> : <DashboardView currentUser={currentUser} />;
      case 'upm-dashboard': return canAccessUPMTools ? <UPMManagementDashboardView currentUser={currentUser} /> : <DashboardView currentUser={currentUser} />;
      case 'upm-structure': return canAccessUPMTools ? <UPMStructureView currentUser={currentUser} /> : <DashboardView currentUser={currentUser} />;
      case 'upm-admin': return canAccessUPMTools ? <UPMAdminView /> : <DashboardView currentUser={currentUser} />;
      case 'auditor-trends': return canAccessTrendAnalysis ? <AuditorTrendView /> : <DashboardView currentUser={currentUser} />;
      case 'master': return (canAccessUserManagement || canAccessUnitManagement) ? <MasterDataView currentUserRole={userRole} /> : <DashboardView currentUser={currentUser} />;
      case 'backend': return isSuperAdmin ? <BackendPreviewView /> : <DashboardView currentUser={currentUser} />;
      case 'api-contract': return isSuperAdmin ? <ApiContractView /> : <DashboardView currentUser={currentUser} />;
      case 'settings': return canAccessSettings ? <SettingsView currentUser={currentUser} /> : <DashboardView currentUser={currentUser} />;
      case 'prodi-profile': return canAccessProdiProfile ? <ProdiProfileView userRole={userRole} userUnit={currentUser?.unitName} /> : <DashboardView currentUser={currentUser} />;
      default: return <DashboardView currentUser={currentUser} />;
    }
  };
  
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <aside className={`bg-slate-900 text-slate-300 flex flex-col flex-shrink-0 relative transition-all duration-300 border-r border-slate-800 ${isSidebarCollapsed ? 'w-20' : 'w-64'}`}>
        <div className={`p-4 border-b border-slate-800 flex items-center gap-3 transition-all duration-300 ${isSidebarCollapsed ? 'justify-center' : ''}`}>
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg shadow-pepi-green-500/20 p-1 flex-shrink-0">
            <img 
              src={brandingConfig.appLogo} 
              alt="Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <div className={`overflow-hidden transition-opacity duration-200 ${isSidebarCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>
            <h1 className="text-white font-bold leading-none tracking-tight whitespace-nowrap">{brandingConfig.appName}</h1>
            <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider font-bold whitespace-nowrap">Audit Mutu Internal</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto custom-scrollbar">
          {!isSidebarCollapsed && <p className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Main Menu</p>}
          <SidebarItem icon={<LayoutDashboard />} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} isCollapsed={isSidebarCollapsed} />
          <SidebarItem icon={<UserCog />} label="Profil & Portofolio" active={activeTab === 'profile-portfolio'} onClick={() => setActiveTab('profile-portfolio')} isCollapsed={isSidebarCollapsed} />
          <SidebarItem icon={<BarChart3 />} label="Progres Siklus AMI" active={activeTab === 'timeline'} onClick={() => setActiveTab('timeline')} isCollapsed={isSidebarCollapsed} />
          {canAccessProdiProfile && <SidebarItem icon={<Building2 />} label="Profil Prodi (LED)" active={activeTab === 'prodi-profile'} onClick={() => setActiveTab('prodi-profile')} isCollapsed={isSidebarCollapsed} />}
          {canAccessSubmission && <SidebarItem icon={<UploadCloud />} label="Unggah Dokumen" active={activeTab === 'submission'} onClick={() => setActiveTab('submission')} isCollapsed={isSidebarCollapsed} />}
          {isAuditee && auditStatus === 'FIELD_AUDIT' && (
            <SidebarItem icon={<ClipboardList />} label="Audit AMI" active={activeTab === 'audit-ami'} onClick={() => setActiveTab('audit-ami')} isCollapsed={isSidebarCollapsed} />
          )}
          {isAuditor && (
            <>
              <SidebarItem icon={<GanttChart />} label="Perencanaan Audit" active={activeTab === 'planning'} onClick={() => setActiveTab('planning')} isCollapsed={isSidebarCollapsed} />
              <SidebarItem icon={<Eye />} label="Desk Evaluation" active={activeTab === 'desk-eval'} onClick={() => setActiveTab('desk-eval')} isCollapsed={isSidebarCollapsed} />
              <SidebarItem icon={<ClipboardList />} label="Audit Lapangan" active={activeTab === 'execution'} onClick={() => setActiveTab('execution')} isCollapsed={isSidebarCollapsed} />
            </>
          )}
          <SidebarItem icon={<AlertCircle />} label="Temuan & RTL" active={activeTab === 'findings'} onClick={() => setActiveTab('findings')} isCollapsed={isSidebarCollapsed} />
          {canAccessAdminWorkflow && <SidebarItem icon={<FileCheck2 />} label="Administrasi AMI" active={activeTab === 'admin-workflow'} onClick={() => setActiveTab('admin-workflow')} isCollapsed={isSidebarCollapsed} />}
          {canAccessDiscussion && <SidebarItem icon={<MessageSquareText />} label="Diskusi & Klarifikasi" active={activeTab === 'discussion'} onClick={() => setActiveTab('discussion')} isCollapsed={isSidebarCollapsed} />}
          
          <div className={`my-4 border-t border-slate-800/50 ${isSidebarCollapsed ? 'mx-2' : 'mx-4'}`} />
          {!isSidebarCollapsed && <p className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Management</p>}
          
          {canAccessRTM && <SidebarItem icon={<Users />} label="RTM (Tinjauan)" active={activeTab === 'rtm'} onClick={() => setActiveTab('rtm')} isCollapsed={isSidebarCollapsed} />}
          {canAccessUPMTools && <SidebarItem icon={<Presentation />} label="Info UPM" active={activeTab === 'upm-dashboard'} onClick={() => setActiveTab('upm-dashboard')} isCollapsed={isSidebarCollapsed} />}
          {canAccessUPMTools && <SidebarItem icon={<Building2 />} label="Struktur & Tugas" active={activeTab === 'upm-structure'} onClick={() => setActiveTab('upm-structure')} isCollapsed={isSidebarCollapsed} />}
          {canAccessUPMTools && <SidebarItem icon={<Settings />} label="Workspace UPM" active={activeTab === 'upm-admin'} onClick={() => setActiveTab('upm-admin')} isCollapsed={isSidebarCollapsed} />}
          {canAccessTrendAnalysis && <SidebarItem icon={<TrendingUp />} label="Analisis Tren Auditor" active={activeTab === 'auditor-trends'} onClick={() => setActiveTab('auditor-trends')} isCollapsed={isSidebarCollapsed} />}
          {(canAccessUserManagement || canAccessUnitManagement) && <SidebarItem icon={<Database />} label="Master Data" active={activeTab === 'master'} onClick={() => setActiveTab('master')} isCollapsed={isSidebarCollapsed} />}
          {isSuperAdmin && (
            <>
              <div className={`my-4 border-t border-slate-800/50 ${isSidebarCollapsed ? 'mx-2' : 'mx-4'}`} />
              {!isSidebarCollapsed && <p className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Dev Tools</p>}
              <SidebarItem icon={<FileCode />} label="Backend Blueprint" active={activeTab === 'backend'} onClick={() => setActiveTab('backend')} isCollapsed={isSidebarCollapsed} />
              <SidebarItem icon={<FileCode />} label="API Contract" active={activeTab === 'api-contract'} onClick={() => setActiveTab('api-contract')} isCollapsed={isSidebarCollapsed} />
            </>
          )}
        </nav>

        <div className="p-3 border-t border-slate-800 space-y-2">
           <button onClick={() => setActiveTab('profile-portfolio')} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${isSidebarCollapsed ? 'justify-center' : ''} hover:bg-slate-800`}>
             <div className="w-8 h-8 rounded-full bg-pepi-green-500 flex items-center justify-center text-white font-bold flex-shrink-0">
               {currentUser?.name?.charAt(0).toUpperCase() || 'U'}
             </div>
             <div className={`overflow-hidden transition-opacity duration-200 ${isSidebarCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>
               <p className="text-sm font-bold text-white truncate capitalize whitespace-nowrap">{currentUser?.name}</p>
               <p className="text-[10px] text-pepi-green-400 font-bold uppercase tracking-wide truncate whitespace-nowrap">{currentUser?.role}</p>
             </div>
           </button>
           <div className="flex gap-2">
             <button onClick={logout} className="w-full flex items-center justify-center gap-2 py-2 text-xs font-bold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 rounded-lg transition-colors">
               <LogOut size={16} /> {!isSidebarCollapsed && 'Keluar'}
             </button>
             <button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className="p-2 text-slate-400 hover:bg-slate-800 rounded-lg transition-colors">
               {isSidebarCollapsed ? <PanelLeftOpen size={16}/> : <PanelLeftClose size={16}/>}
             </button>
           </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 flex-shrink-0 z-10 shadow-sm">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest">
            <span className="text-slate-900">{activeTab.replace('-', ' ')}</span>
            <ChevronRight size={14} />
            <span className="text-pepi-green-700">Siklus AMI 2024/2025</span>
          </div>
          <div className="flex items-center gap-4">
            {currentUser?.unitName && (
              (currentUser.role === Role.AUDITOR && currentUser.assignedUnits && currentUser.assignedUnits.length > 1) ? (
                <div className="relative group hidden md:block">
                    <Building2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-pepi-green-700 pointer-events-none z-10"/>
                    <select value={currentUser.unitCode} onChange={(e) => handleAuditorUnitChange(e.target.value)} className="cursor-pointer appearance-none pl-9 pr-8 py-1.5 bg-pepi-green-50 text-pepi-green-700 rounded-lg border border-pepi-green-100 text-xs font-bold focus:ring-2 focus:ring-pepi-green-500 outline-none">
                        {currentUser.assignedUnits.map(unitCode => {
                            const unitName = allUnits.find(u => u.kode_unit === unitCode)?.nama_unit || unitCode;
                            return <option key={unitCode} value={unitCode}>{unitName}</option>
                        })}
                    </select>
                    <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-pepi-green-700 pointer-events-none"/>
                </div>
              ) : (
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-pepi-green-50 text-pepi-green-700 rounded-lg border border-pepi-green-100">
                    <Building2 size={14} />
                    <span className="text-xs font-bold">{currentUser.unitName}</span>
                </div>
              )
            )}
            <div className="relative group">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-pepi-green-500 transition-colors" />
              <input type="text" placeholder="Cari data..." className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-sm focus:ring-2 focus:ring-pepi-green-500 w-64 transition-all outline-none" />
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default AppShell;
