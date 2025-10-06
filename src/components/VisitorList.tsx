import React from 'react';
import { User, Building, Clock, CheckCircle, XCircle, LogOut, RotateCcw } from 'lucide-react';
import { Visitor } from '../types/visitor';

interface VisitorListProps {
  visitors: Visitor[];
  onCheckOut: (visitorId: string) => void;
  onCancelCheckOut: (visitorId: string) => void;
}

const VisitorList: React.FC<VisitorListProps> = ({ visitors, onCheckOut, onCancelCheckOut }) => {
  const formatTime = (date: Date) => {
    return date.toLocaleString('ja-JP', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const activeVisitors = visitors.filter(v => v.status === 'checked-in');
  const checkedOutVisitors = visitors.filter(v => v.status === 'checked-out');

  const handleCancelCheckOut = (visitorId: string, visitorName: string) => {
    const confirmed = window.confirm(
      `${visitorName}様の退館を取り消して、在館中の状態に戻しますか？\n\n続行しますか？`
    );
    
    if (confirmed) {
      onCancelCheckOut(visitorId);
    }
  };
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6">
          <h2 className="text-xl font-bold flex items-center space-x-2">
            <CheckCircle className="w-6 h-6" />
            <span>在館中の来客 ({activeVisitors.length}名)</span>
          </h2>
        </div>

        <div className="p-6">
          {activeVisitors.length === 0 ? (
            <p className="text-gray-500 text-center py-8">現在在館中の来客はいません</p>
          ) : (
            <div className="space-y-4">
              {activeVisitors.map((visitor) => (
                <div key={visitor.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center space-x-3">
                        <User className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900">{visitor.name}</p>
                          <p className="text-sm text-gray-500">{visitor.company}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <Building className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900">{visitor.department}</p>
                          <p className="text-sm text-gray-500">{visitor.contactPerson}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <Clock className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900">{formatTime(visitor.checkInTime)}</p>
                          <p className="text-sm text-gray-500">受付時刻</p>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => onCheckOut(visitor.id)}
                      className="ml-4 flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>退館</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-gray-600 to-gray-700 text-white p-6">
          <h2 className="text-xl font-bold flex items-center space-x-2">
            <XCircle className="w-6 h-6" />
            <span>本日の退館済み来客</span>
          </h2>
        </div>

        <div className="p-6">
          {checkedOutVisitors.length === 0 ? (
            <p className="text-gray-500 text-center py-8">本日の退館済み来客はいません</p>
          ) : (
            <div className="space-y-3">
              {checkedOutVisitors.slice(0, 10).map((visitor) => (
                <div key={visitor.id} className="border border-gray-100 rounded-lg p-3 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-sm flex-1">
                    <div>
                      <span className="font-medium">{visitor.name}</span>
                      <span className="text-gray-500 ml-2">({visitor.company})</span>
                    </div>
                    <div className="text-gray-600">{visitor.department}</div>
                    <div className="text-gray-600">{formatTime(visitor.checkInTime)} 入館</div>
                    <div className="text-gray-600">
                      {visitor.checkOutTime && formatTime(visitor.checkOutTime)} 退館
                    </div>
                    </div>
                    <button
                      onClick={() => handleCancelCheckOut(visitor.id, visitor.name)}
                      className="ml-4 flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg transition-colors text-sm"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>退館取消</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VisitorList;