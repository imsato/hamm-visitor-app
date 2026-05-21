import React, { useState } from 'react';
import { User, Search } from 'lucide-react';
import { getStaffByStaffID } from '../hooks/useFormOptions';
import { Staff } from '../types/visitor';

interface StaffIDVerifyProps {
  title: string;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: (staffName: string) => void;
  onCancel?: () => void;
}

const StaffIDVerify: React.FC<StaffIDVerifyProps> = ({
  title, confirmLabel, cancelLabel, onConfirm, onCancel,
}) => {
  const [staffIDInput, setStaffIDInput] = useState('');
  const [foundStaff, setFoundStaff] = useState<Staff | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [looking, setLooking] = useState(false);

  const staffLabel = foundStaff
    ? (foundStaff.statitle ? `${foundStaff.statitle}）${foundStaff.staname}` : foundStaff.staname)
    : '';

  const handleLookup = async () => {
    if (!staffIDInput.trim()) return;
    setLooking(true);
    setFoundStaff(null);
    setNotFound(false);
    const result = await getStaffByStaffID(staffIDInput.trim());
    if (result) {
      setFoundStaff(result);
    } else {
      setNotFound(true);
    }
    setLooking(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleLookup();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStaffIDInput(e.target.value);
    setFoundStaff(null);
    setNotFound(false);
  };

  return (
    <div className="space-y-4">
      <p className="text-sm font-medium text-gray-700">{title}</p>

      <div className="flex gap-2">
        <input
          type="text"
          value={staffIDInput}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          maxLength={7}
          placeholder="職員番号（7桁）"
          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
        />
        <button
          type="button"
          onClick={handleLookup}
          disabled={!staffIDInput.trim() || looking}
          className="px-4 py-3 bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-300 text-white rounded-lg flex items-center gap-1 transition-colors"
        >
          <Search className="w-4 h-4" />
          確認
        </button>
      </div>

      {looking && <p className="text-sm text-gray-500">検索中...</p>}
      {notFound && <p className="text-sm text-red-600">職員番号が見つかりません</p>}

      {foundStaff && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
          <User className="w-5 h-5 text-green-600 flex-shrink-0" />
          <div>
            <p className="text-xs text-green-700">窓口担当者</p>
            <p className="font-medium text-green-900">{staffLabel}</p>
          </div>
        </div>
      )}

      {foundStaff && (
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => onConfirm(staffLabel)}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
          >
            {confirmLabel}
          </button>
          {cancelLabel && onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              {cancelLabel}
            </button>
          )}
        </div>
      )}

      {!foundStaff && cancelLabel && onCancel && (
        <button
          type="button"
          onClick={onCancel}
          className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors"
        >
          {cancelLabel}
        </button>
      )}
    </div>
  );
};

export default StaffIDVerify;
