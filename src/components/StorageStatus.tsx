import React from 'react';
import { Database, HardDrive, AlertCircle } from 'lucide-react';

interface StorageStatusProps {
  useLocalStorage: boolean;
}

const StorageStatus: React.FC<StorageStatusProps> = ({ useLocalStorage }) => {
  if (!useLocalStorage) {
    return (
      <div className="fixed bottom-4 right-4 bg-green-50 border border-green-200 rounded-lg px-4 py-2 shadow-sm">
        <div className="flex items-center space-x-2 text-sm text-green-700">
          <Database className="w-4 h-4" />
          <span>データベース接続中</span>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2 shadow-sm">
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-2 text-sm text-yellow-700">
          <HardDrive className="w-4 h-4" />
          <span>ローカルモード</span>
        </div>
        <div className="relative group">
          <AlertCircle className="w-4 h-4 text-yellow-600 cursor-help" />
          <div className="absolute bottom-full right-0 mb-2 hidden group-hover:block w-64 bg-gray-900 text-white text-xs rounded-lg p-3 shadow-lg z-50">
            <p className="mb-1 font-medium">ローカルストレージモードで動作中</p>
            <p className="text-gray-300">
              データベース接続ができないため、ブラウザのローカルストレージにデータを保存しています。
              このブラウザでのみデータが保持されます。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StorageStatus;
