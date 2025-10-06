import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Visitor } from '../types/visitor';

export const useVisitors = () => {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // データベースから来客者データを取得
  const fetchVisitors = useCallback(async () => {
    try {
      setLoading(true);
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'データの取得に失敗しました');
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

      const newVisitor: Visitor = {
        id: data.id,
        name: data.name,
        company: data.company,
        department: data.department,
        contactPerson: data.contact_person,
        purpose: data.purpose,
        phone: data.phone,
        email: data.email || '',
        visitorCount: data.visitor_count,
        hasParking: data.has_parking,
        vehicleNumber: data.vehicle_number || undefined,
        checkInTime: new Date(data.check_in_time),
        status: data.status,
        badgeNumber: data.badge_number || undefined,
      };

      setVisitors(prev => [newVisitor, ...prev]);
      return newVisitor;
    } catch (err) {
      setError(err instanceof Error ? err.message : '来客者の登録に失敗しました');
      throw err;
    }
  }, []);

  const checkOutVisitor = useCallback(async (visitorId: string) => {
    try {
      console.log('退館処理開始:', visitorId);
      
      // 更新前のデータ確認
      const { data: beforeData, error: beforeError } = await supabase
        .from('visitors')
        .select('*')
        .eq('id', visitorId)
        .single();
      
      if (beforeError) {
        console.error('更新前データ取得エラー:', beforeError);
        throw new Error(`データ取得に失敗しました: ${beforeError.message}`);
      }
      
      console.log('更新前のデータ:', beforeData);
      
      // 既に退館済みの場合はエラー
      if (beforeData.status === 'checked-out') {
        throw new Error('この来客者は既に退館済みです');
      }
      
      const checkOutTime = new Date().toISOString();
      const updatedAt = new Date().toISOString();
      
      console.log('更新データ:', {
        status: 'checked-out',
        check_out_time: checkOutTime,
        updated_at: updatedAt
      });
      
      const { data: updateData, error: updateError } = await supabase
        .from('visitors')
        .update({
          status: 'checked-out',
          check_out_time: checkOutTime,
          updated_at: updatedAt,
        })
        .eq('id', visitorId)
        .select()
        .single();

      if (updateError) {
        console.error('Supabase更新エラー:', updateError);
        throw new Error(`データベース更新に失敗しました: ${updateError.message}`);
      }
      
      console.log('データベース更新成功:', updateData);
      
      // 更新後のデータ確認
      const { data: verifyData, error: verifyError } = await supabase
        .from('visitors')
        .select('id, name, status, check_out_time')
        .eq('id', visitorId)
        .single();
      
      if (verifyError) {
        console.error('更新確認エラー:', verifyError);
      } else {
        console.log('更新後のデータ:', verifyData);
      }

      // ローカル状態を即座に更新
      setVisitors(prev => 
        prev.map(visitor => 
          visitor.id === visitorId 
            ? { ...visitor, status: 'checked-out' as const, checkOutTime: new Date(checkOutTime) }
            : visitor
        )
      );
      
      // データ再取得で確実に同期
      await fetchVisitors();
      
      console.log('ローカル状態更新完了');
    } catch (err) {
      console.error('退館処理エラー詳細:', err);
      setError(err instanceof Error ? err.message : '退館処理に失敗しました');
      throw err;
    }
  }, []);

  const cancelCheckOut = useCallback(async (visitorId: string) => {
    try {
      console.log('退館取消処理開始:', visitorId);
      
      // データベース接続確認
      const { data: testData, error: testError } = await supabase
        .from('visitors')
        .select('id, name, status')
        .eq('id', visitorId)
        .single();
      
      if (testError) {
        console.error('データベース接続エラー:', testError);
        throw new Error(`データベース接続に失敗しました: ${testError.message}`);
      }
      
      console.log('取消前のデータ:', testData);
      
      const updatedAt = new Date().toISOString();
      
      console.log('更新データ:', {
        status: 'checked-in',
        check_out_time: null,
        updated_at: updatedAt
      });
      
      const { data: updateData, error } = await supabase
        .from('visitors')
        .update({
          status: 'checked-in',
          check_out_time: null,
          updated_at: updatedAt,
        })
        .eq('id', visitorId)
        .select();

      if (error) {
        console.error('Supabase更新エラー:', error);
        throw new Error(`データベース更新に失敗しました: ${error.message}`);
      }
      
      console.log('データベース更新成功:', updateData);
      
      // 更新後のデータ確認
      const { data: verifyData, error: verifyError } = await supabase
        .from('visitors')
        .select('id, name, status, check_out_time')
        .eq('id', visitorId)
        .single();
      
      if (verifyError) {
        console.error('更新確認エラー:', verifyError);
      } else {
        console.log('更新後のデータ:', verifyData);
      }

      setVisitors(prev => 
        prev.map(visitor => 
          visitor.id === visitorId 
            ? { ...visitor, status: 'checked-in' as const, checkOutTime: undefined }
            : visitor
        )
      );
      
      console.log('ローカル状態更新完了');
    } catch (err) {
      console.error('退館取消処理エラー詳細:', err);
      setError(err instanceof Error ? err.message : '退館取消処理に失敗しました');
      throw err;
    }
  }, []);
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