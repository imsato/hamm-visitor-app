import React, { useState } from 'react';
import { User, Building, Phone, Mail, MessageSquare, Users, Send, Car } from 'lucide-react';
import { Visitor, VisitorFormInitialData, VisitPurpose } from '../types/visitor';
import { useFormOptions } from '../hooks/useFormOptions';

interface VisitorFormProps {
  onSubmit: (
    visitor: Omit<Visitor, 'id' | 'checkInTime' | 'status'>,
    formState: VisitorFormInitialData
  ) => void;
  onCancel: () => void;
  initialData?: VisitorFormInitialData;
}

const visitPurposes: VisitPurpose[] = [
  { id: '1', label: '面談・会議', category: 'meeting' },
  { id: '2', label: '授業・講演', category: 'interview' },
  { id: '3', label: '入学相談・学校見学', category: 'interview' },
  { id: '4', label: '配送・納品', category: 'delivery' },
  { id: '5', label: '設備点検・工事', category: 'maintenance' },
  { id: '6', label: 'その他', category: 'other' },
];

const VisitorForm: React.FC<VisitorFormProps> = ({ onSubmit, onCancel, initialData }) => {
  const { destinations, departments, staff } = useFormOptions();

  const [formData, setFormData] = useState(() => ({
    name: initialData?.name || '',
    company: initialData?.company || '',
    department: initialData?.department || '',
    contactDepartment: initialData?.contactDepartment || '',
    contactPerson: initialData?.contactPerson || '',
    purpose: initialData?.purpose || '',
    phone: initialData?.phone || '',
    email: initialData?.email || '',
    hasParking: initialData?.hasParking || false,
    vehicleNumber: initialData?.vehicleNumber || '',
  }));

  const [selectedDepartmentId, setSelectedDepartmentId] = useState(() => initialData?.selectedDepartmentId || '');
  const [otherPurposeText, setOtherPurposeText] = useState(() => initialData?.otherPurposeText || '');
  const [isOtherSelected, setIsOtherSelected] = useState(() => initialData?.isOtherSelected || false);
  const [visitorCount, setVisitorCount] = useState<number | null>(() => initialData?.visitorCount || null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const filteredStaff = selectedDepartmentId
    ? staff.filter(s => s.departmentId === selectedDepartmentId)
    : [];

  const formatStaffLabel = (s: typeof staff[0]) =>
    s.statitle ? `${s.statitle}）${s.staname}` : s.staname;

  const handleDepartmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const deptId = e.target.value;
    const dept = departments.find(d => d.id === deptId);
    setSelectedDepartmentId(deptId);
    setFormData(prev => ({
      ...prev,
      contactDepartment: dept ? dept.depname : '',
      contactPerson: '',
    }));
    if (errors.contactDepartment) setErrors(prev => ({ ...prev, contactDepartment: '' }));
    if (errors.contactPerson) setErrors(prev => ({ ...prev, contactPerson: '' }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'hasParking') {
      const hasParking = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: hasParking,
        vehicleNumber: hasParking ? prev.vehicleNumber : '',
      }));
    } else if (name === 'otherPurpose') {
      setOtherPurposeText(value);
      setFormData(prev => ({ ...prev, purpose: value ? `その他: ${value}` : 'その他' }));
    } else {
      if (name === 'purpose') {
        setIsOtherSelected(value === 'その他');
        if (value !== 'その他') setOtherPurposeText('');
      }
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleVisitorCountSelect = (count: number) => {
    setVisitorCount(count);
    if (errors.visitorCount) setErrors(prev => ({ ...prev, visitorCount: '' }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!visitorCount) newErrors.visitorCount = '来客人数は必須です';
    if (!formData.name.trim()) newErrors.name = 'お名前は必須です';
    if (!formData.company.trim()) newErrors.company = '会社名・団体名は必須です';
    if (!formData.department) newErrors.department = '訪問先は必須です';
    if (!formData.contactDepartment) newErrors.contactDepartment = '面会部署は必須です';
    if (!formData.contactPerson) newErrors.contactPerson = '面会担当者は必須です';
    if (!formData.purpose.trim()) newErrors.purpose = '訪問目的は必須です';

    if (formData.hasParking && !formData.vehicleNumber.trim()) {
      newErrors.vehicleNumber = '駐車する場合は車両ナンバーの入力が必要です';
    }
    if (formData.vehicleNumber && formData.vehicleNumber.length > 10) {
      newErrors.vehicleNumber = '車両ナンバーは10文字以内で入力してください';
    }
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'メールアドレスの形式が正しくありません';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      const formState: VisitorFormInitialData = {
        ...formData,
        visitorCount,
        selectedDepartmentId,
        isOtherSelected,
        otherPurposeText,
      };
      onSubmit(
        {
          ...formData,
          visitorCount: visitorCount!,
          hasParking: formData.hasParking,
          vehicleNumber: formData.hasParking ? formData.vehicleNumber : undefined,
        },
        formState
      );
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">来客受付</h2>
        <p className="text-gray-600">以下の項目をご入力ください *必須 </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            <Users className="inline w-4 h-4 mr-1" />
            来客人数 *
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { count: 1, label: '1名' },
              { count: 2, label: '2名' },
              { count: 3, label: '3名' },
              { count: 4, label: '4名以上' }
            ].map(({ count, label }) => (
              <button
                key={count}
                type="button"
                onClick={() => handleVisitorCountSelect(count)}
                className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                  visitorCount === count
                    ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                    : 'border-gray-300 hover:border-yellow-300 hover:bg-yellow-50'
                }`}
              >
                <User className={`w-6 h-6 mx-auto mb-1 ${visitorCount === count ? 'text-yellow-600' : 'text-gray-400'}`} />
                <div className={`text-sm font-medium ${visitorCount === count ? 'text-yellow-700' : 'text-gray-700'}`}>
                  {label}
                </div>
              </button>
            ))}
          </div>
          {errors.visitorCount && <p className="mt-1 text-sm text-red-600">{errors.visitorCount}</p>}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="inline w-4 h-4 mr-1" />
              お名前 （複数人の場合には代表１名）*
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors ${errors.name ? 'border-red-300' : 'border-gray-300'}`}
              placeholder="山田 太郎"
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Building className="inline w-4 h-4 mr-1" />
              会社名・団体名 *
            </label>
            <input
              type="text"
              name="company"
              value={formData.company}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors ${errors.company ? 'border-red-300' : 'border-gray-300'}`}
              placeholder="株式会社○○"
            />
            {errors.company && <p className="mt-1 text-sm text-red-600">{errors.company}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Building className="inline w-4 h-4 mr-1" />
            訪問先 *
          </label>
          <select
            name="department"
            value={formData.department}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors ${errors.department ? 'border-red-300' : 'border-gray-300'}`}
          >
            <option value="">選択してください</option>
            {destinations.map(dest => (
              <option key={dest.id} value={dest.name}>{dest.name}</option>
            ))}
          </select>
          {errors.department && <p className="mt-1 text-sm text-red-600">{errors.department}</p>}
        </div>

        <div className="space-y-4 border border-gray-200 rounded-lg p-4 bg-gray-50">
          <p className="text-sm font-medium text-gray-700">
            <User className="inline w-4 h-4 mr-1" />
            面会担当者 *
          </p>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Step 1　面会部署を選択</label>
            <select
              value={selectedDepartmentId}
              onChange={handleDepartmentChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors bg-white ${errors.contactDepartment ? 'border-red-300' : 'border-gray-300'}`}
            >
              <option value="">選択してください</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>{dept.depname}</option>
              ))}
            </select>
            {errors.contactDepartment && <p className="mt-1 text-sm text-red-600">{errors.contactDepartment}</p>}
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Step 2　担当者を選択</label>
            <select
              name="contactPerson"
              value={formData.contactPerson}
              onChange={handleInputChange}
              disabled={!selectedDepartmentId}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors bg-white disabled:bg-gray-100 disabled:text-gray-400 ${errors.contactPerson ? 'border-red-300' : 'border-gray-300'}`}
            >
              <option value="">{selectedDepartmentId ? '選択してください' : '先に面会部署を選択してください'}</option>
              {selectedDepartmentId && (
                <option value="担当者未定">担当者未定</option>
              )}
              {filteredStaff.map(s => (
                <option key={s.id} value={formatStaffLabel(s)}>{formatStaffLabel(s)}</option>
              ))}
            </select>
            {errors.contactPerson && <p className="mt-1 text-sm text-red-600">{errors.contactPerson}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <MessageSquare className="inline w-4 h-4 mr-1" />
            訪問目的 *
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
            {visitPurposes.map(purpose => (
              <label
                key={purpose.id}
                className={`flex items-center p-3 border rounded-lg cursor-pointer hover:bg-yellow-50 transition-colors ${
                  formData.purpose === purpose.label ? 'border-yellow-500 bg-yellow-50' : 'border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="purpose"
                  value={purpose.label}
                  checked={purpose.label === 'その他' ? isOtherSelected : formData.purpose === purpose.label}
                  onChange={handleInputChange}
                  className="sr-only"
                />
                <span className="text-sm font-medium">{purpose.label}</span>
              </label>
            ))}
          </div>
          {isOtherSelected && (
            <textarea
              name="otherPurpose"
              value={otherPurposeText}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors"
              placeholder="詳細をご記入ください"
              rows={3}
            />
          )}
          {errors.purpose && <p className="mt-1 text-sm text-red-600">{errors.purpose}</p>}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Phone className="inline w-4 h-4 mr-1" />
              電話番号
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors ${errors.phone ? 'border-red-300' : 'border-gray-300'}`}
              placeholder="090-1234-5678"
            />
            {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Mail className="inline w-4 h-4 mr-1" />
              メールアドレス
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors ${errors.email ? 'border-red-300' : 'border-gray-300'}`}
              placeholder="example@company.com"
            />
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              <Car className="inline w-4 h-4 mr-1" />
              駐車有無 *
            </label>
            <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-yellow-50 transition-colors">
              <input
                type="checkbox"
                name="hasParking"
                checked={formData.hasParking}
                onChange={handleInputChange}
                className="mr-3 h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
              />
              <span className="text-sm font-medium">車で来校（校舎前に駐車）</span>
            </label>
          </div>

          {formData.hasParking && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Car className="inline w-4 h-4 mr-1" />
                車両ナンバー（4桁のナンバーのみでも入力可） *
              </label>
              <input
                type="text"
                name="vehicleNumber"
                value={formData.vehicleNumber}
                onChange={handleInputChange}
                maxLength={10}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors ${errors.vehicleNumber ? 'border-red-300' : 'border-gray-300'}`}
                placeholder="例: 浜松123あ4567"
              />
              {errors.vehicleNumber && <p className="mt-1 text-sm text-red-600">{errors.vehicleNumber}</p>}
            </div>
          )}
        </div>

        <div className="flex gap-4 pt-6">
          <button
            type="submit"
            className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white py-4 px-6 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
          >
            <Send className="w-5 h-5" />
            <span>入力を完了する</span>
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-4 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            キャンセル
          </button>
        </div>
      </form>
    </div>
  );
};

export default VisitorForm;
