import React, { useState } from 'react';
import { MoreHorizontal, Edit, Trash2, Save, X } from 'lucide-react';
import { User, Unit } from '../types';

interface AuditorCardProps {
  auditor: User & { activeAssignments: number };
  units: Unit[];
  onEdit: (auditor: User & { activeAssignments: number }) => void;
  onSave: (auditor: User & { activeAssignments: number }, editedData: Partial<User>) => void;
  onDelete: (auditor: User & { activeAssignments: number }) => void;
}

const AuditorCard: React.FC<AuditorCardProps> = ({ auditor, units, onEdit, onSave, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<Partial<User>>({
    assignedUnits: auditor.assignedUnits || []
  });
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleEdit = () => {
    setIsEditing(true);
    setIsMenuOpen(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedData({ assignedUnits: auditor.assignedUnits || [] });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      console.log('Starting fetch to save auditor assignment...');
      await onSave(auditor, editedData);
      setIsEditing(false);
      alert('Data auditor berhasil disimpan.');
    } catch (error) {
      alert('Gagal menyimpan data auditor.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    if (window.confirm('Yakin ingin menghapus auditor ini dari tim?')) {
      onDelete(auditor);
    }
  };

  const handleUnitChange = (unitCode: string, checked: boolean) => {
    const current = editedData.assignedUnits || [];
    if (checked) {
      setEditedData({ ...editedData, assignedUnits: [...current, unitCode] });
    } else {
      setEditedData({ ...editedData, assignedUnits: current.filter(u => u !== unitCode) });
    }
  };

  return (
    <div key={auditor.id} className="flex items-center gap-4 p-3 bg-slate-50 rounded-2xl border border-slate-100 group relative">
      <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center font-bold">
        {auditor.nama.charAt(0)}
      </div>
      {isEditing ? (
        <div className="flex-1 space-y-2">
          <p className="font-bold text-slate-800 text-sm">{auditor.nama}</p>
          <div>
            <label className="text-xs text-slate-600">Unit yang ditugaskan:</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {units.map(unit => (
                <label key={unit.id} className="flex items-center gap-1 text-xs">
                  <input
                    type="checkbox"
                    checked={(editedData.assignedUnits || []).includes(unit.kode_unit)}
                    onChange={(e) => handleUnitChange(unit.kode_unit, e.target.checked)}
                    className="w-3 h-3"
                  />
                  {unit.kode_unit}
                </label>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs font-bold flex items-center gap-1"
            >
              <Save size={12} /> {isSaving ? 'Menyimpan...' : 'Simpan'}
            </button>
            <button
              onClick={handleCancel}
              className="px-3 py-1 bg-slate-100 rounded-lg text-xs font-bold"
            >
              <X size={12} /> Batal
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1">
          <p className="font-bold text-slate-800 text-sm">{auditor.nama}</p>
          <p className="text-[10px] text-slate-500">{auditor.activeAssignments} penugasan aktif</p>
        </div>
      )}
      {!isEditing && (
        <div className="relative">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-1 rounded-full hover:bg-slate-200 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <MoreHorizontal size={16} />
          </button>
          {isMenuOpen && (
            <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-10">
              <button
                onClick={handleEdit}
                className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-slate-50 w-full text-left"
              >
                <Edit size={14} /> Edit
              </button>
              <button
                onClick={handleDelete}
                className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-slate-50 w-full text-left text-rose-600"
              >
                <Trash2 size={14} /> Hapus
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AuditorCard;
