import React from 'react';
import { School, Clock } from 'lucide-react';

const Header: React.FC = () => {
  const [currentTime, setCurrentTime] = React.useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <header className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white p-6 shadow-lg">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <School className="w-10 h-10" />
          <div>
            <h1 className="text-2xl font-bold">浜松未来総合専門学校</h1>
            <p className="text-yellow-100">来客受付システム</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 bg-yellow-700/30 px-4 py-2 rounded-lg">
          <Clock className="w-5 h-5" />
          <span className="font-mono text-lg">
            {currentTime.toLocaleString('ja-JP')}
          </span>
        </div>
      </div>
    </header>
  );
};

export default Header;