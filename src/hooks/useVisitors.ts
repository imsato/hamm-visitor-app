import { useState, useCallback, useEffect } from 'react';
import { Visitor } from '../types/visitor';

// ローカルストレージのキー
const LOCAL_STORAGE_KEY = 'visitor_app_data';

// ローカルストレージからデータを取得
const getLocalData = (): Visitor[] => {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

// ローカルストレージにデータを保存
const saveLocalData = (visitors: Visitor[]) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(visitors));
  } catch (error) {
    console.error('ローカルストレージへの保存に失敗:', error);
  }
};

// UUIDを生成する簡単な関数
const generateId = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export const useVisitors = () => {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useLocalStorage, setUseLocalStorage] = useState(false);

  // Supabaseから来客者データを取得を試行
  const fetchVisitors = useCallback(async () => {
    try {
      setLoading(true);
      
      // Supabase接続を試行
      try {
        const { supabase } = await import('../lib/supabase');
        const { data, error } = await supabase
          .from('visitors')
          .select('*')
          .order('check_in_time', { ascending: false });

        if (error) throw error;

        const formattedVisitors: Visitor[] = data.map(visitor => ({
          id: visitor.id,
          name: visitor.name,
          company: visitor.company,
          department: visitor.department,
          contactPerson: visitor.contact_person,
          purpose: visitor.purpose,
          phone: visitor.phone,
          email: visitor.email || '',
          visitorCount: visitor.visitor_count,
          hasParking: visitor.has_parking || false,
          vehicleNumber: visitor.vehicle_number || undefined,
          checkInTime: new Date(visitor.check_in_time),
          checkOutTime: visitor.check_out_time ? new Date(visitor.check_out_time) : undefined,
          status: visitor.status,
          badgeNumber: visitor.badge_number || undefined,
        }));

        setVisitors(formattedVisitors);
        setError(null);
        setUseLocalStorage(false);
      } catch (supabaseError) {
        console.warn('Supabase接続に失敗、ローカルストレージを使用:', supabaseError);
        
        // ローカルストレージからデータを取得
        const localData = getLocalData();
        const formattedLocalData: Visitor[] = localData.map(visitor => ({
          ...visitor,
          checkInTime: new Date(visitor.checkInTime),
          checkOutTime: visitor.checkOutTime ? new Date(visitor.checkOutTime) : undefined,
        }));
        
        setVisitors(formattedLocalData);
        setError(null);
        setUseLocalStorage(true);
      }
    } catch (err) {
      console.error('データ取得エラー:', err);
      
      // 最終的にローカルストレージを使用
      const localData = getLocalData();
      const formattedLocalData: Visitor[] = localData.map(visitor => ({
        ...visitor,
        checkInTime: new Date(visitor.checkInTime),
        checkOutTime: visitor.checkOutTime ? new Date(visitor.checkOutTime) : undefined,
      }));
      
      setVisitors(formattedLocalData);
      setUseLocalStorage(true);
      setError('データベース接続に失敗しました。ローカルデータを使用しています。');
    } finally {
      setLoading(false);
    }
  }, []);

  // 初回データ取得
  useEffect(() => {
    fetchVisitors();
  }, [fetchVisitors]);

  const addVisitor = useCallback(async (visitorData: Omit<Visitor, 'id' | 'checkInTime' | 'status'>) => {
    try {
      const newVisitor: Visitor = {
        id: generateId(),
        name: visitorData.name,
        company: visitorData.company,
        department: visitorData.department,
        contactPerson: visitorData.contactPerson,
        purpose: visitorData.purpose,
        phone: visitorData.phone,
        email: visitorData.email || '',
        visitorCount: visitorData.visitorCount || 1,
        hasParking: visitorData.hasParking,
        vehicleNumber: visitorData.vehicleNumber || undefined,
        checkInTime: new Date(),
        status: 'checked-in' as const,
        badgeNumber: undefined,
      };

      if (!useLocalStorage) {
        try {
          const { supabase } = await import('../lib/supabase');
          const { data, error } = await supabase
            .from('visitors')
            .insert({
              name: visitorData.name,
              company: visitorData.company,
              department: visitorData.department,
              contact_person: visitorData.contactPerson,
              purpose: visitorData.purpose,
              phone: visitorData.phone,
              email: visitorData.email || null,
              visitor_count: visitorData.visitorCount || 1,
              has_parking: visitorData.hasParking,
              vehicle_number: visitorData.vehicleNumber || null,
              status: 'checked-in',
            })
            .select()
            .single();

          if (error) throw error;

          newVisitor.id = data.id;
        } catch (supabaseError) {
          console.warn('Supabase登録に失敗、ローカルストレージを使用:', supabaseError);
          setUseLocalStorage(true);
        }
      }

      const updatedVisitors = [newVisitor, ...visitors];
      setVisitors(updatedVisitors);
      
      // ローカルストレージに保存
      saveLocalData(updatedVisitors);
      
      return newVisitor;
    } catch (err) {
      setError(err instanceof Error ? err.message : '来客者の登録に失敗しました');
      throw err;
    }
  }, []);

  const checkOutVisitor = useCallback(async (visitorId: string) => {
    try {
      const visitor = visitors.find(v => v.id === visitorId);
      if (!visitor) {
        throw new Error('来客者が見つかりません');
      }
      
      if (visitor.status === 'checked-out') {
        throw new Error('この来客者は既に退館済みです');
      }
      
      const checkOutTime = new Date().toISOString();
      
      if (!useLocalStorage) {
        try {
          const { supabase } = await import('../lib/supabase');
          const { error: updateError } = await supabase
            .from('visitors')
            .update({
              status: 'checked-out',
              check_out_time: checkOutTime,
              updated_at: new Date().toISOString(),
            })
            .eq('id', visitorId);

          if (updateError) {
            console.warn('Supabase更新に失敗、ローカルストレージを使用:', updateError);
            setUseLocalStorage(true);
          }
        } catch (supabaseError) {
          console.warn('Supabase更新に失敗、ローカルストレージを使用:', supabaseError);
          setUseLocalStorage(true);
        }
      }

      // ローカル状態を即座に更新
      const updatedVisitors = visitors.map(visitor => 
        visitor.id === visitorId 
          ? { ...visitor, status: 'checked-out' as const, checkOutTime: new Date(checkOutTime) }
          : visitor
      );
      
      setVisitors(updatedVisitors);
      saveLocalData(updatedVisitors);
      
      setVisitors(prev => 
        prev.map(visitor => 
          visitor.id === visitorId 
            ? { ...visitor, status: 'checked-out' as const, checkOutTime: new Date(checkOutTime) }
            : visitor
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : '退館処理に失敗しました');
      throw err;
    }
  }, [visitors, useLocalStorage]);

  const cancelCheckOut = useCallback(async (visitorId: string) => {
    try {
      const visitor = visitors.find(v => v.id === visitorId);
      if (!visitor) {
        throw new Error('来客者が見つかりません');
      }
      
      if (!useLocalStorage) {
        try {
          const { supabase } = await import('../lib/supabase');
          const { error } = await supabase
            .from('visitors')
            .update({
              status: 'checked-in',
              check_out_time: null,
              updated_at: new Date().toISOString(),
            })
            .eq('id', visitorId);

          if (error) {
            console.warn('Supabase更新に失敗、ローカルストレージを使用:', error);
            setUseLocalStorage(true);
          }
        } catch (supabaseError) {
          console.warn('Supabase更新に失敗、ローカルストレージを使用:', supabaseError);
          setUseLocalStorage(true);
        }
      }

      // ローカル状態を更新
      const updatedVisitors = visitors.map(visitor => 
        visitor.id === visitorId 
          ? { ...visitor, status: 'checked-in' as const, checkOutTime: undefined }
          : visitor
      );
      
      setVisitors(updatedVisitors);
      saveLocalData(updatedVisitors);
      
      setVisitors(prev => 
        prev.map(visitor => 
          visitor.id === visitorId 
            ? { ...visitor, status: 'checked-in' as const, checkOutTime: undefined }
            : visitor
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : '退館取消処理に失敗しました');
      throw err;
    }
  }, [visitors, useLocalStorage]);
  
  const getTodaysVisitors = useCallback(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return visitors.filter(visitor => {
      const visitorDate = new Date(visitor.checkInTime);
      visitorDate.setHours(0, 0, 0, 0);
      return visitorDate.getTime() === today.getTime();
    });
  }, [visitors]);

  const getHistoryVisitors = useCallback(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return visitors.filter(visitor => {
      const visitorDate = new Date(visitor.checkInTime);
      visitorDate.setHours(0, 0, 0, 0);
      return visitorDate.getTime() < today.getTime();
    }).sort((a, b) => new Date(b.checkInTime).getTime() - new Date(a.checkInTime).getTime());
  }, [visitors]);

  return {
    visitors,
    loading,
    error,
    addVisitor,
    checkOutVisitor,
    cancelCheckOut,
    getTodaysVisitors,
    getHistoryVisitors,
    refetch: fetchVisitors,
  };
};