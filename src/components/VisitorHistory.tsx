import React, { useState } from 'react';
import { User, Building, Clock, AlertCircle, ChevronLeft, ChevronRight, RotateCcw, Users } from 'lucide-react';
import { Visitor } from '../types/visitor';

interface VisitorHistoryProps {
  visitors: Visitor[];
  onCheckOut: (visitorId: string) => void;
}

const ITEMS_PER_PAGE = 10;

const VisitorHistory: React.FC<VisitorHistoryProps> = ({ visitors, onCheckOut }) => {
  const [currentPage, setCurrentPage] = useState(0);

  const formatTime = (date: Date) => {
    return date.toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const handleRetroactiveCheckOut = (visitorId: string, visitorName: string) => {
    const confirmed = window.confirm(
      `${visitorName}様の退館処理を現在の日時で実行しますか？\n\n※過去の在館中レコードに対する退館処理です。\n\n続行しますか？`
    );
    
    if (confirmed) {
      onCheckOut(visitorId);
    }
  };

  const formatVisitorCount = (count: number) => {
    if (count === 1) return '１名';
    if (count === 2) return '２名';
    if (count === 3) return '３名';
    return '４名以上';
  };

  const totalPages = Math.ceil(visitors.length / ITEMS_PER_PAGE);
  const startIndex = currentPage * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentVisitors = visitors.slice(startIndex, endIndex);

  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(0, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(totalPages - 1, prev + 1));
  };

  const handleBackToLatest = () => {
    setCurrentPage(0);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
          <h2 className="text-xl font-bold flex items-center space-x-2">
            <Clock className="w-6 h-6" />
            <span>過去の来客履歴 ({visitors.length}件)</span>
          </h2>
          <p className="text-blue-100 mt-1">本日以前の来客記録を表示しています</p>
        </div>

        <div className="p-6">
          {visitors.length === 0 ? (
            <p className="text-gray-500 text-center py-8">過去の来客履歴はありません</p>
          ) : (
            <>
              <div className="space-y-3">
                {currentVisitors.map((visitor) => (
                  <div key={visitor.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-6 gap-3">
                        <div className="flex items-center space-x-2 md:col-span-2">
                          <User className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="font-medium text-gray-900">{visitor.name}</p>
                            <p className="text-sm text-gray-500 truncate">{visitor.company}</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Building className="w-5 h-5 text-gray-400" />
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900">{visitor.department}</p>
                            <p className="text-sm text-gray-500 truncate">{visitor.contactPerson}</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Users className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="font-medium text-gray-900">{formatVisitorCount(visitor.visitorCount)}</p>
                            <p className="text-sm text-gray-500">来館人数</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Clock className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="font-medium text-gray-900">{formatDate(visitor.checkInTime)}</p>
                            <p className="text-sm text-gray-500">{formatTime(visitor.checkInTime)} 入館</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <div>
                            {visitor.status === 'checked-out' ? (
                              <>
                                <p className="font-medium text-gray-900">退館済み</p>
                                <p className="text-sm text-gray-500">
                                  {visitor.checkOutTime && formatTime(visitor.checkOutTime)}
                                </p>
                              </>
                            ) : (
                              <>
                                <p className="font-medium text-orange-600">在館中</p>
                                <p className="text-sm text-orange-500">退館処理未完了</p>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center">
                          {visitor.status === 'checked-in' && (
                            <button
                              onClick={() => handleRetroactiveCheckOut(visitor.id, visitor.name)}
                              className="flex items-center space-x-1 bg-orange-600 hover:bg-orange-700 text-white px-2 py-1 rounded text-xs"
                            >
                              <AlertCircle className="w-4 h-4" />
                              <span>？在館中</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* ページネーション */}
              <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={handlePrevPage}
                    disabled={currentPage === 0}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                      currentPage === 0
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>前ページ</span>
                  </button>

                  <button
                    onClick={handleNextPage}
                    disabled={currentPage >= totalPages - 1}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                      currentPage >= totalPages - 1
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    <span>次ページ</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">
                    {startIndex + 1} - {Math.min(endIndex, visitors.length)} / {visitors.length}件
                  </span>
                  
                  <button
                    onClick={handleBackToLatest}
                    disabled={currentPage === 0}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                      currentPage === 0
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-green-600 hover:bg-green-700 text-white'
                    }`}
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>最新に戻る</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VisitorHistory;