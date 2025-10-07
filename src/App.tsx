import React, { useState } from 'react';
import { Users, UserPlus, List, User } from 'lucide-react';
import Header from './components/Header';
import VisitorForm from './components/VisitorForm';
import VisitorBadge from './components/VisitorBadge';
import VisitorList from './components/VisitorList';
import { useVisitors } from './hooks/useVisitors';
import { Visitor } from './types/visitor';
import VisitorHistory from './components/VisitorHistory';

type AppState = 'home' | 'form' | 'badge' | 'list' | 'history';

function App() {
  const [currentState, setCurrentState] = useState<AppState>('home');
  const [currentVisitor, setCurrentVisitor] = useState<Visitor | null>(null);
  const { visitors, loading, error, addVisitor, checkOutVisitor, cancelCheckOut, getTodaysVisitors, getHistoryVisitors } = useVisitors();

  const handleNewVisitor = () => {
    setCurrentState('form');
    setCurrentVisitor(null);
  };

  const handleFormSubmit = async (visitorData: Omit<Visitor, 'id' | 'checkInTime' | 'status'>) => {
    try {
      const newVisitor = await addVisitor(visitorData);
      setCurrentVisitor(newVisitor);
      setCurrentState('badge');
    } catch (err) {
      // エラーハンドリングはuseVisitors内で行われる
      console.error('受付処理でエラーが発生しました:', err);
    }
  };

  const handleFormCancel = () => {
    setCurrentState('home');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleNewVisitorFromBadge = () => {
    setCurrentState('form');
    setCurrentVisitor(null);
  };

  const handleViewList = () => {
    setCurrentState('list');
  };

  const handleViewHistory = () => {
    setCurrentState('history');
  };

  const handleBackToHome = () => {
    setCurrentState('home');
  };

  const handleCheckOut = async (visitorId: string) => {
    try {
      console.log('退館処理開始 - App.tsx:', visitorId);
      
      // 処理前の状態確認
      const visitor = visitors.find(v => v.id === visitorId);
      console.log('退館対象の来客者:', visitor);
      
      await checkOutVisitor(visitorId);
      console.log('退館処理完了 - App.tsx');
      
      // 成功メッセージ
      if (currentState === 'history') {
        alert('過去の退館処理が完了しました。');
      } else {
        alert('退館処理が完了しました。');
      }
    } catch (err) {
      console.error('退館処理でエラーが発生しました:', err);
      // ユーザーにエラーを表示
      alert(`退館処理でエラーが発生しました: ${err instanceof Error ? err.message : '不明なエラー'}`);
    }
  };

  const handleCancelCheckOut = async (visitorId: string) => {
    try {
      console.log('退館取消処理開始 - App.tsx:', visitorId);
      
      // 処理前の状態確認
      const visitor = visitors.find(v => v.id === visitorId);
      console.log('退館取消対象の来客者:', visitor);
      
      await cancelCheckOut(visitorId);
      console.log('退館取消処理完了 - App.tsx');
      
      // 成功メッセージ
      alert('退館取消処理が完了しました。');
    } catch (err) {
      console.error('退館取消処理でエラーが発生しました:', err);
      // ユーザーにエラーを表示
      alert(`退館取消処理でエラーが発生しました: ${err instanceof Error ? err.message : '不明なエラー'}`);
    }
  };
  const todaysVisitors = getTodaysVisitors();
  const activeVisitors = todaysVisitors.filter(v => v.status === 'checked-in');

  // ローディング表示
  if (loading && visitors.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mx-auto mb-4"></div>
          <p className="text-gray-600">データを読み込み中...</p>
        </div>
      </div>
    );
  }

  // エラー表示
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg max-w-md">
          <div className="text-red-600 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">エラーが発生しました</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg"
          >
            再読み込み
          </button>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (currentState) {
      case 'form':
        return <VisitorForm onSubmit={handleFormSubmit} onCancel={handleFormCancel} />;
      
      case 'badge':
        return currentVisitor ? (
          <VisitorBadge 
            visitor={currentVisitor} 
            onPrint={handlePrint}
            onNewVisitor={handleNewVisitorFromBadge}
          />
        ) : null;
      
      case 'list':
        return <VisitorList visitors={todaysVisitors} onCheckOut={handleCheckOut} onCancelCheckOut={handleCancelCheckOut} />;
      
      case 'history':
        return <VisitorHistory visitors={getHistoryVisitors()} onCheckOut={handleCheckOut} />;
      
      default:
        return (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                ようこそ浜松未来総合専門学校へ
              </h2>
              <p className="text-xl text-gray-600">
                受付手続きを開始してください
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <button
                onClick={handleNewVisitor}
                className="group bg-gradient-to-br from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white p-8 rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
              >
                <UserPlus className="w-16 h-16 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-2xl font-bold mb-2">新規受付</h3>
                <p className="text-yellow-100">来客受付を開始します</p>
              </button>

              <button
                onClick={handleViewList}
                className="group bg-gradient-to-br from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white p-8 rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
              >
                <List className="w-16 h-16 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-2xl font-bold mb-2">来客管理</h3>
                <p className="text-green-100">在館者一覧・退館手続き</p>
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Users className="w-6 h-6 text-yellow-600" />
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">本日の来客状況</h3>
                    <p className="text-gray-600">現在　在館中: {activeVisitors.length}名</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-yellow-600">{todaysVisitors.length}</div>
                  <div className="text-sm text-gray-600">本日の総来客数</div>
                </div>
              </div>
            </div>

            {currentState === 'home' && (
              <div className="mt-8 text-center">
                <button
                  onClick={handleViewHistory}
                  className="inline-flex items-center space-x-2 text-yellow-600 hover:text-yellow-700 font-medium"
                >
                  <List className="w-5 h-5" />
                  <span>過去の来客一覧を見る</span>
                </button>
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="py-8 px-4">
        {currentState !== 'home' && (
          <div className="max-w-6xl mx-auto mb-6">
            <button
              onClick={handleBackToHome}
              className="flex items-center space-x-2 text-yellow-600 hover:text-yellow-700 font-medium"
            >
              <span>← ホームに戻る</span>
            </button>
          </div>
        )}
        
        {renderContent()}
      </main>

      <footer className="bg-white border-t border-gray-200 py-6 mt-12">
        <div className="max-w-6xl mx-auto text-center text-gray-600">
          <p>&copy; 2024 浜松未来総合専門学校 来客受付システム</p>
        </div>
      </footer>
    </div>
  );
}

export default App;