import React, { useState } from 'react';
import { User, Building, Clock, Hash } from 'lucide-react';
import { Visitor } from '../types/visitor';
import StaffIDVerify from './StaffIDVerify';

interface VisitorBadgeProps {
  visitor: Visitor;
  onPrint: () => void;
  onComplete: (staffName: string) => void;
  onBackToForm: () => void;
}

const VisitorBadge: React.FC<VisitorBadgeProps> = ({ visitor, onPrint, onComplete, onBackToForm }) => {
  const [step, setStep] = useState<'view' | 'verify'>('view');

  const formatTime = (date: Date) => {
    return date.toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white p-6 text-center">
          <h2 className="text-xl font-bold mb-1">入館証</h2>
          <p className="text-yellow-100">入力内容の確認</p>
        </div>

        <div className="p-6 space-y-4" id="visitor-badge">
          <div className="text-center border-b pb-4">
            <h3 className="text-lg font-bold text-gray-900">浜松未来総合専門学校</h3>
            <p className="text-sm text-gray-600">Hamamatsu Mirai Professional Training Colleges</p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <User className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="text-sm text-gray-600">お名前（代表者）</p>
                <p className="font-medium">{visitor.name} 様</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Building className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="text-sm text-gray-600">会社名</p>
                <p className="font-medium">{visitor.company}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Hash className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="text-sm text-gray-600">訪問先</p>
                <p className="font-medium">{visitor.department}</p>
              </div>
            </div>

            {visitor.contactDepartment && (
              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-yellow-600" />
                <div>
                  <p className="text-sm text-gray-600">面会担当</p>
                  <p className="font-medium">{visitor.contactDepartment}　{visitor.contactPerson}</p>
                </div>
              </div>
            )}

            <div className="flex items-center space-x-3">
              <Clock className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="text-sm text-gray-600">受付時刻</p>
                <p className="font-medium">{formatTime(visitor.checkInTime)}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <p className="text-sm text-gray-600">退館時は受付にお声がけください</p>
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {step === 'view' ? (
          <>
            <button
              onClick={() => setStep('verify')}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-medium transition-colors"
            >
              受付完了（窓口担当者が行う）
            </button>
            <button
              onClick={onPrint}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-3 px-6 rounded-lg font-medium transition-colors"
            >
              入館証を印刷する
            </button>
          </>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">窓口担当者の確認</h3>
            <StaffIDVerify
              title="職員番号を入力して担当者を確認してください"
              confirmLabel="受付完了"
              cancelLabel="入力内容を修正する"
              onConfirm={onComplete}
              onCancel={onBackToForm}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default VisitorBadge;
