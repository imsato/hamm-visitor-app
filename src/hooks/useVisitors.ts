import { useState, useCallback, useEffect } from 'react';
import { Visitor } from '../types/visitor';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  query,
  orderBy,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore';

const LOCAL_STORAGE_KEY = 'visitor_app_data';

const getLocalData = (): Visitor[] => {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const saveLocalData = (visitors: Visitor[]) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(visitors));
  } catch (error) {
    console.error('ローカルストレージへの保存に失敗:', error);
  }
};

export const useVisitors = () => {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useLocalStorage, setUseLocalStorage] = useState(false);

  const fetchVisitors = useCallback(async () => {
    try {
      setLoading(true);

      try {
        const { db } = await import('../lib/firebase');

        const q = query(
          collection(db, 'visitors'),
          orderBy('checkInTime', 'desc')
        );

        const snapshot = await getDocs(q);

        const formattedVisitors: Visitor[] = snapshot.docs.map(docSnap => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            name: data.name,
            company: data.company,
            department: data.department,
            contactDepartment: data.contactDepartment || undefined,
            contactPerson: data.contactPerson,
            purpose: data.purpose,
            phone: data.phone,
            email: data.email || '',
            visitorCount: data.visitorCount,
            hasParking: data.hasParking || false,
            vehicleNumber: data.vehicleNumber || undefined,
            checkInTime: data.checkInTime instanceof Timestamp
              ? data.checkInTime.toDate()
              : new Date(data.checkInTime),
            checkOutTime: data.checkOutTime instanceof Timestamp
              ? data.checkOutTime.toDate()
              : data.checkOutTime ? new Date(data.checkOutTime) : undefined,
            status: data.status,
            badgeNumber: data.badgeNumber || undefined,
          };
        });

        setVisitors(formattedVisitors);
        setError(null);
        setUseLocalStorage(false);
        console.log('Firestoreからデータを正常に取得しました');
      } catch (firebaseError) {
        console.warn('Firebase接続に失敗、ローカルストレージを使用:', firebaseError);
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
      const localData = getLocalData();
      const formattedLocalData: Visitor[] = localData.map(visitor => ({
        ...visitor,
        checkInTime: new Date(visitor.checkInTime),
        checkOutTime: visitor.checkOutTime ? new Date(visitor.checkOutTime) : undefined,
      }));
      setVisitors(formattedLocalData);
      setUseLocalStorage(true);
      setError(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVisitors();
  }, [fetchVisitors]);

  const addVisitor = useCallback(async (visitorData: Omit<Visitor, 'id' | 'checkInTime' | 'status'>) => {
    try {
      const checkInTime = new Date();
      const newVisitor: Visitor = {
        id: crypto.randomUUID(),
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
        checkInTime,
        status: 'checked-in',
        badgeNumber: undefined,
      };

      if (!useLocalStorage) {
        try {
          const { db } = await import('../lib/firebase');
          const docRef = await addDoc(collection(db, 'visitors'), {
            name: visitorData.name,
            company: visitorData.company,
            department: visitorData.department,
            contactDepartment: visitorData.contactDepartment || null,
            contactPerson: visitorData.contactPerson,
            purpose: visitorData.purpose,
            phone: visitorData.phone,
            email: visitorData.email || null,
            visitorCount: visitorData.visitorCount || 1,
            hasParking: visitorData.hasParking,
            vehicleNumber: visitorData.vehicleNumber || null,
            checkInTime: Timestamp.fromDate(checkInTime),
            checkOutTime: null,
            status: 'checked-in',
            badgeNumber: null,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
          newVisitor.id = docRef.id;
        } catch (firebaseError) {
          console.warn('Firebase登録に失敗、ローカルストレージを使用:', firebaseError);
          setUseLocalStorage(true);
        }
      }

      setVisitors(prev => {
        const updated = [newVisitor, ...prev];
        saveLocalData(updated);
        return updated;
      });

      return newVisitor;
    } catch (err) {
      setError(err instanceof Error ? err.message : '来客者の登録に失敗しました');
      throw err;
    }
  }, [useLocalStorage]);

  const checkOutVisitor = useCallback(async (visitorId: string) => {
    try {
      const visitor = visitors.find(v => v.id === visitorId);
      if (!visitor) throw new Error('来客者が見つかりません');
      if (visitor.status === 'checked-out') throw new Error('この来客者は既に退館済みです');

      const checkOutTime = new Date();

      if (!useLocalStorage) {
        try {
          const { db } = await import('../lib/firebase');
          await updateDoc(doc(db, 'visitors', visitorId), {
            status: 'checked-out',
            checkOutTime: Timestamp.fromDate(checkOutTime),
            updatedAt: serverTimestamp(),
          });
        } catch (firebaseError) {
          console.warn('Firebase更新に失敗、ローカルストレージを使用:', firebaseError);
          setUseLocalStorage(true);
        }
      }

      setVisitors(prev => {
        const updated = prev.map(v =>
          v.id === visitorId
            ? { ...v, status: 'checked-out' as const, checkOutTime }
            : v
        );
        saveLocalData(updated);
        return updated;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : '退館処理に失敗しました');
      throw err;
    }
  }, [visitors, useLocalStorage]);

  const cancelCheckOut = useCallback(async (visitorId: string) => {
    try {
      const visitor = visitors.find(v => v.id === visitorId);
      if (!visitor) throw new Error('来客者が見つかりません');

      if (!useLocalStorage) {
        try {
          const { db } = await import('../lib/firebase');
          await updateDoc(doc(db, 'visitors', visitorId), {
            status: 'checked-in',
            checkOutTime: null,
            updatedAt: serverTimestamp(),
          });
        } catch (firebaseError) {
          console.warn('Firebase更新に失敗、ローカルストレージを使用:', firebaseError);
          setUseLocalStorage(true);
        }
      }

      setVisitors(prev => {
        const updated = prev.map(v =>
          v.id === visitorId
            ? { ...v, status: 'checked-in' as const, checkOutTime: undefined }
            : v
        );
        saveLocalData(updated);
        return updated;
      });
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
    return visitors
      .filter(visitor => {
        const visitorDate = new Date(visitor.checkInTime);
        visitorDate.setHours(0, 0, 0, 0);
        return visitorDate.getTime() < today.getTime();
      })
      .sort((a, b) => new Date(b.checkInTime).getTime() - new Date(a.checkInTime).getTime());
  }, [visitors]);

  return {
    visitors,
    loading,
    error,
    useLocalStorage,
    addVisitor,
    checkOutVisitor,
    cancelCheckOut,
    getTodaysVisitors,
    getHistoryVisitors,
    refetch: fetchVisitors,
  };
};
