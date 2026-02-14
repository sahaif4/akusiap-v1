import React from 'react';
import { X } from 'lucide-react';
import FindingForm from './FindingForm';
import { Unit } from '../types';

interface AddFindingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (finding: any) => void;
  findingToEdit?: any | null;
  units: Unit[];
}

const AddFindingModal: React.FC<AddFindingModalProps> = ({ isOpen, onClose, onSave, findingToEdit, units }) => {
  if (!isOpen) return null;
  const isEditing = !!findingToEdit;

  const handleFormSubmit = (formData: any) => {
    const payload = isEditing 
      ? { ...findingToEdit, ...formData } 
      : { id: Date.now(), ...formData };
    onSave(payload);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" 
        onClick={onClose}
      />
      
      {/* Modal Card */}
      <div className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200" aria-describedby="modal-description">
        <div className="bg-slate-50 px-8 py-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 id="modal-title" className="text-xl font-bold text-slate-900">
              {isEditing ? 'Edit Temuan Audit' : 'Tambah Temuan Baru'}
            </h3>
            <p id="modal-description" className="text-sm text-slate-500 mt-1 uppercase tracking-tight font-medium">Internal Audit Mutu PEPI</p>
          </div>
          <button 
            onClick={onClose}
            aria-label="Tutup modal"
            className="p-2 hover:bg-white rounded-full text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-8 overflow-y-auto max-h-[80vh]">
          <FindingForm 
            onSubmit={handleFormSubmit} 
            onCancel={onClose} 
            initialData={findingToEdit}
            units={units}
          />
        </div>
      </div>
    </div>
  );
};

export default AddFindingModal;
