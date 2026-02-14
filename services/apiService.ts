import { User, Unit, CurrentUser, StandardDocument, AuditorProfile, UnitProfile, Instrument, DocumentStatus, FindingType, RiskLevel, Role, UnitSubmissionStatus, Standard, UPMAgenda, StrategicAgenda, UPMProfile, UPMMember, UPMProgram } from '../types';
import { DashboardData, ActivityLogItem, UnitCode } from '../types/dashboard';

// Dynamic API URL - works for both localhost and network access
const getApiBaseUrl = () => {
  const hostname = window.location.hostname;
  // If accessing from network IP (e.g., 192.168.0.213), use that IP
  // Otherwise use localhost
  const apiHost = hostname === 'localhost' ? '127.0.0.1' : hostname;
  return `http://${apiHost}:8000/api`;
};

export const API_BASE_URL = getApiBaseUrl();
const API_DELAY = 400;

function getCookie(name: string): string | null {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

function getHeaders(contentType = 'application/json') {
  const token = localStorage.getItem('access_token');
  const csrfToken = getCookie('csrftoken');

  const headers: HeadersInit = {
    'Content-Type': contentType,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (csrfToken) {
    headers['X-CSRFToken'] = csrfToken;
  }

  return headers;
}

async function handleApiError(response: Response, defaultMessage: string) {
  let errorData;
  try {
    errorData = await response.json();
  } catch (e) {
    throw new Error(`${defaultMessage}: ${response.status} ${response.statusText}`);
  }

  if (response.status === 401 || errorData.code === 'token_not_valid') {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    throw new Error("Sesi login telah berakhir atau tidak valid. Silakan refresh halaman dan login kembali.");
  }

  const message = errorData.detail || (typeof errorData === 'string' ? errorData : JSON.stringify(errorData));
  throw new Error(message || defaultMessage);
}

// --- API FUNCTIONS ---

export async function login(username: string, password: string): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Username atau password salah.');
    }
    await handleApiError(response, 'Login gagal');
  }
  return await response.json();
}

export async function getFindings(): Promise<any[]> {
  const response = await fetch(`${API_BASE_URL}/findings/`, { headers: getHeaders() });
  if (!response.ok) return [];
  return await response.json();
}

export async function getUPMAgendas(): Promise<UPMAgenda[]> {
  const response = await fetch(`${API_BASE_URL}/upm-agendas/`, { headers: getHeaders() });
  if (!response.ok) return [];
  return await response.json();
}

export async function saveUPMAgenda(agenda: Partial<UPMAgenda>): Promise<UPMAgenda> {
  const isEditing = typeof agenda.id === 'number';
  const url = isEditing ? `${API_BASE_URL}/upm-agendas/${agenda.id}/` : `${API_BASE_URL}/upm-agendas/`;
  const method = isEditing ? 'PUT' : 'POST';
  const response = await fetch(url, { method, headers: getHeaders(), body: JSON.stringify(agenda) });
  if (!response.ok) await handleApiError(response, 'Gagal menyimpan agenda');
  return await response.json();
}

export async function deleteUPMAgenda(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/upm-agendas/${id}/`, { method: 'DELETE', headers: getHeaders() });
  if (!response.ok) await handleApiError(response, 'Gagal menghapus agenda');
}

export async function getAuditAssignments(): Promise<any[]> {
  const response = await fetch(`${API_BASE_URL}/audit-assignments/`, { headers: getHeaders() });
  if (!response.ok) return [];
  return await response.json();
}

export async function saveAuditAssignment(assignment: any): Promise<any> {
  const isEditing = typeof assignment.id === 'number';
  const url = isEditing ? `${API_BASE_URL}/audit-assignments/${assignment.id}/` : `${API_BASE_URL}/audit-assignments/`;
  const method = isEditing ? 'PUT' : 'POST';
  const response = await fetch(url, { method, headers: getHeaders(), body: JSON.stringify(assignment) });
  if (!response.ok) await handleApiError(response, 'Gagal menyimpan penugasan audit');
  return await response.json();
}

export async function getAuditStatus(unitName: string): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}/audit-status/?unit_name=${encodeURIComponent(unitName)}`, {
      headers: getHeaders(),
    });
    if (!response.ok) return { status: 'NO_AUDIT' };
    return await response.json();
  } catch (error) {
    return { status: 'NO_AUDIT' };
  }
}

// --- UPM STRUCTURE API ---

export async function getUPMProfiles(): Promise<UPMProfile[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/upm-profiles/`, { headers: getHeaders() });
    if (!response.ok) throw new Error();
    return await response.json();
  } catch (e) {
    return [];
  }
}

export async function saveUPMProfile(profile: Partial<UPMProfile>): Promise<UPMProfile> {
  const isEditing = typeof profile.id === 'number';
  const url = isEditing ? `${API_BASE_URL}/upm-profiles/${profile.id}/` : `${API_BASE_URL}/upm-profiles/`;
  const method = isEditing ? 'PUT' : 'POST';
  const response = await fetch(url, { method, headers: getHeaders(), body: JSON.stringify(profile) });
  if (!response.ok) await handleApiError(response, 'Gagal menyimpan profil UPM');
  return await response.json();
}

export async function getUPMMembers(): Promise<UPMMember[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/upm-members/`, { headers: getHeaders() });
    if (!response.ok) throw new Error();
    return await response.json();
  } catch (e) {
    return [];
  }
}

export async function saveUPMMember(member: Partial<UPMMember>): Promise<UPMMember> {
  const isEditing = typeof member.id === 'number';
  const url = isEditing ? `${API_BASE_URL}/upm-members/${member.id}/` : `${API_BASE_URL}/upm-members/`;
  const method = isEditing ? 'PUT' : 'POST';
  const response = await fetch(url, { method, headers: getHeaders(), body: JSON.stringify(member) });
  if (!response.ok) await handleApiError(response, 'Gagal menyimpan anggota UPM');
  return await response.json();
}

export async function deleteUPMMember(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/upm-members/${id}/`, { method: 'DELETE', headers: getHeaders() });
  if (!response.ok) await handleApiError(response, 'Gagal menghapus anggota UPM');
}

export async function getUPMPrograms(): Promise<UPMProgram[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/upm-programs/`, { headers: getHeaders() });
    if (!response.ok) throw new Error();
    return await response.json();
  } catch (e) {
    return [];
  }
}

export async function saveUPMProgram(program: Partial<UPMProgram>): Promise<UPMProgram> {
  const isEditing = typeof program.id === 'number';
  const url = isEditing ? `${API_BASE_URL}/upm-programs/${program.id}/` : `${API_BASE_URL}/upm-programs/`;
  const method = isEditing ? 'PUT' : 'POST';
  const response = await fetch(url, { method, headers: getHeaders(), body: JSON.stringify(program) });
  if (!response.ok) await handleApiError(response, 'Gagal menyimpan program UPM');
  return await response.json();
}

export async function deleteUPMProgram(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/upm-programs/${id}/`, { method: 'DELETE', headers: getHeaders() });
  if (!response.ok) await handleApiError(response, 'Gagal menghapus program UPM');
}

export async function getDashboardData(unit: UnitCode, user: CurrentUser): Promise<DashboardData | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/dashboard/?unit=${unit}`, { headers: getHeaders() });
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error('Failed to fetch dashboard data');
    }
    const json = await response.json();
    return json.data || json; // Handle wrapped or unwrapped response
  } catch (e) {
    console.error("API Error getDashboardData:", e);
    return null;
  }
}

export async function getUsers(): Promise<User[]> {
  const response = await fetch(`${API_BASE_URL}/users/`, { headers: getHeaders() });
  if (!response.ok) return [];
  return await response.json();
}

export async function saveUser(user: Partial<User>): Promise<User> {
  const isEditing = typeof user.id === 'number';
  const url = isEditing ? `${API_BASE_URL}/users/${user.id}/` : `${API_BASE_URL}/users/`;
  const method = isEditing ? 'PUT' : 'POST';
  const response = await fetch(url, { method, headers: getHeaders(), body: JSON.stringify(user) });
  if (!response.ok) await handleApiError(response, 'Gagal menyimpan pengguna');
  return await response.json();
}

export async function deleteUser(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/users/${id}/`, { method: 'DELETE', headers: getHeaders() });
  if (!response.ok) await handleApiError(response, 'Gagal menghapus pengguna');
}

export async function getUnits(): Promise<Unit[]> {
  const response = await fetch(`${API_BASE_URL}/units/`, { headers: getHeaders() });
  if (!response.ok) return [];
  return await response.json();
}

export async function saveUnit(unit: Partial<Unit>): Promise<Unit> {
  const isEditing = typeof unit.id === 'number';
  const url = isEditing ? `${API_BASE_URL}/units/${unit.id}/` : `${API_BASE_URL}/units/`;
  const method = isEditing ? 'PUT' : 'POST';
  const response = await fetch(url, { method, headers: getHeaders(), body: JSON.stringify(unit) });
  if (!response.ok) await handleApiError(response, 'Gagal menyimpan unit');
  return await response.json();
}

export async function deleteUnit(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/units/${id}/`, { method: 'DELETE', headers: getHeaders() });
  if (!response.ok) await handleApiError(response, 'Gagal menghapus unit');
}

export async function getActiveStrategicAgenda(unit: UnitCode): Promise<StrategicAgenda | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/upm-agendas/?is_active=true`, { headers: getHeaders() });
    if (!response.ok) return null;
    const agendas: UPMAgenda[] = await response.json();
    // Prioritize strategic type
    const active = agendas.find(a => a.agenda_type === 'strategic') || agendas.find(a => a.is_active);
    if (!active) return null;

    return {
      id: active.id,
      name: active.title,
      targetDate: active.target_date || active.start_date,
      description: active.description,
      responsibleUnit: active.responsible_unit,
      isActive: active.is_active,
      reminderDaysBefore: active.reminder_days_before
    };
  } catch (e) {
    return null;
  }
}

export async function getAuditCycles(): Promise<any[]> {
  const response = await fetch(`${API_BASE_URL}/audit-cycles/`, { headers: getHeaders() });
  if (!response.ok) return [];
  return await response.json();
}

export async function saveAuditCycle(cycle: any): Promise<any> {
  const isEditing = typeof cycle.id === 'number';
  const url = isEditing ? `${API_BASE_URL}/audit-cycles/${cycle.id}/` : `${API_BASE_URL}/audit-cycles/`;
  const method = isEditing ? 'PUT' : 'POST';
  const response = await fetch(url, { method, headers: getHeaders(), body: JSON.stringify(cycle) });
  if (!response.ok) await handleApiError(response, 'Gagal menyimpan siklus audit');
  return await response.json();
}

export async function deleteAuditCycle(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/audit-cycles/${id}/`, { method: 'DELETE', headers: getHeaders() });
  if (!response.ok) await handleApiError(response, 'Gagal menghapus siklus audit');
}

export async function getStandards(type: 'standar' | 'unggul'): Promise<Standard[]> {
  // Mock data as backend endpoint for Standards seems missing in urls.py
  // This ensures the Promise.all in AuditPlanningView doesn't fail.
  if (type === 'unggul') {
    return [
      { id: 1, kode_standar: 'S.1', nama_standar: 'Visi, Misi, Tujuan, dan Strategi', kategori: 'Unggul' },
      { id: 2, kode_standar: 'S.2', nama_standar: 'Tata Pamong, Tata Kelola, dan Kerjasama', kategori: 'Unggul' },
      { id: 3, kode_standar: 'S.3', nama_standar: 'Mahasiswa', kategori: 'Unggul' },
      { id: 4, kode_standar: 'S.4', nama_standar: 'Sumber Daya Manusia', kategori: 'Unggul' },
      { id: 5, kode_standar: 'S.5', nama_standar: 'Keuangan, Sarana, dan Prasarana', kategori: 'Unggul' },
      { id: 6, kode_standar: 'S.6', nama_standar: 'Pendidikan', kategori: 'Unggul' },
      { id: 7, kode_standar: 'S.7', nama_standar: 'Penelitian', kategori: 'Unggul' },
      { id: 8, kode_standar: 'S.8', nama_standar: 'Pengabdian kepada Masyarakat', kategori: 'Unggul' },
      { id: 9, kode_standar: 'S.9', nama_standar: 'Luaran dan Capaian Tridharma', kategori: 'Unggul' },
    ];
  }
  return [
    { id: 1, kode_standar: 'S.1', nama_standar: 'Kompetensi Lulusan', kategori: 'SNDikti' },
    { id: 2, kode_standar: 'S.2', nama_standar: 'Isi Pembelajaran', kategori: 'SNDikti' },
    { id: 3, kode_standar: 'S.3', nama_standar: 'Proses Pembelajaran', kategori: 'SNDikti' },
    { id: 4, kode_standar: 'S.4', nama_standar: 'Penilaian Pembelajaran', kategori: 'SNDikti' },
    { id: 5, kode_standar: 'S.5', nama_standar: 'Dosen dan Tenaga Kependidikan', kategori: 'SNDikti' },
    { id: 6, kode_standar: 'S.6', nama_standar: 'Sarana dan Prasarana Pembelajaran', kategori: 'SNDikti' },
    { id: 7, kode_standar: 'S.7', nama_standar: 'Pengelolaan Pembelajaran', kategori: 'SNDikti' },
    { id: 8, kode_standar: 'S.8', nama_standar: 'Pembiayaan Pembelajaran', kategori: 'SNDikti' },
  ];
}

export async function getInstrumentBank(type: string): Promise<Record<string, any[]>> {
  try {
    const response = await fetch(`${API_BASE_URL}/question-bank/?set_type=${type === 'standar' ? 'sndikti' : 'unggul'}`, { headers: getHeaders() });
    if (!response.ok) return {};
    const data = await response.json();
    // Transform array to record keyed by standard
    const bank: Record<string, any[]> = {};
    if (Array.isArray(data)) {
      data.forEach((item: any) => {
        if (!bank[item.standard]) bank[item.standard] = [];
        bank[item.standard].push({
          id: item.id,
          q: item.pertanyaan,
          proof: item.bukti_wajib
        });
      });
    }
    return bank;
  } catch (e) {
    return {};
  }
}

export async function saveInstrument(instrument: Partial<Instrument>): Promise<Instrument> {
  const isEditing = typeof instrument.id === 'number';
  const url = isEditing ? `${API_BASE_URL}/instruments/${instrument.id}/` : `${API_BASE_URL}/instruments/`;
  const method = isEditing ? 'PUT' : 'POST';
  const response = await fetch(url, { method, headers: getHeaders(), body: JSON.stringify(instrument) });
  if (!response.ok) await handleApiError(response, 'Gagal menyimpan instrumen');
  return await response.json();
}

export async function activateAuditPlanning(unitName: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/activate-planning/`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ unit_name: unitName })
  });
  if (!response.ok) await handleApiError(response, 'Gagal mengaktifkan perencanaan');
}

export async function getStandardDocuments(): Promise<StandardDocument[]> {
  const response = await fetch(`${API_BASE_URL}/standard-documents/`, { headers: getHeaders() });
  if (!response.ok) return [];
  return await response.json();
}

export async function saveStandardDocument(doc: Partial<StandardDocument>): Promise<StandardDocument> {
  const isEditing = typeof doc.id === 'number';
  const url = isEditing ? `${API_BASE_URL}/standard-documents/${doc.id}/` : `${API_BASE_URL}/standard-documents/`;
  const method = isEditing ? 'PUT' : 'POST';

  // Use FormData for file upload if needed, but for now assuming JSON or simple implementation
  // If file upload is needed, we need to handle FormData. 
  // Checking the view, it seems to expect JSON or FormData. 
  // StandardDocument has a 'file' field.

  const formData = new FormData();
  Object.entries(doc).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, value as any);
    }
  });

  // For file upload, we usually don't set Content-Type header manually to let browser set boundary
  const headers = getHeaders();
  delete (headers as any)['Content-Type'];

  const response = await fetch(url, { method, headers, body: formData });
  if (!response.ok) await handleApiError(response, 'Gagal menyimpan dokumen standar');
  return await response.json();
}

export async function deleteAuditAssignment(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/audit-assignments/${id}/`, { method: 'DELETE', headers: getHeaders() });
  if (!response.ok) await handleApiError(response, 'Gagal menghapus penugasan audit');
}

// --- DESK EVALUATION API ---

export async function getDeskEvaluationInstruments(unitName: string): Promise<Instrument[]> {
  const response = await fetch(`${API_BASE_URL}/desk-evaluation/instruments/?unit_name=${encodeURIComponent(unitName)}`, { headers: getHeaders() });
  if (!response.ok) throw new Error("Gagal memuat instrumen evaluasi");
  const json = await response.json();
  return Array.isArray(json) ? json : (json.data || []);
}

export async function getSubmissionStatus(unitName: string): Promise<UnitSubmissionStatus> {
  const response = await fetch(`${API_BASE_URL}/desk-evaluation/status/?unit_name=${encodeURIComponent(unitName)}`, { headers: getHeaders() });
  if (!response.ok) return UnitSubmissionStatus.DRAFT;
  const data = await response.json();
  return data.status as UnitSubmissionStatus;
}

export async function submitAuditResponse(data: { instrument_id: number, unit_name: string, answer_text?: string, uploaded_file?: string }): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/desk-evaluation/submit-response/`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data)
  });
  if (!response.ok) await handleApiError(response, "Gagal menyimpan respon audit");
}

export async function setSubmissionStatus(unitName: string, status: UnitSubmissionStatus): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/desk-evaluation/set-status/`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ unit_name: unitName, status })
  });
  if (!response.ok) await handleApiError(response, "Gagal mengubah status submisi");
}
