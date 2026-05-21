import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';
import { Destination, Department, Staff } from '../types/visitor';

export const useFormOptions = () => {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const { db } = await import('../lib/firebase');

        const [destSnap, deptSnap, staffSnap] = await Promise.all([
          getDocs(query(collection(db, 'destinations'), orderBy('order'))),
          getDocs(query(collection(db, 'departments'), orderBy('order'))),
          getDocs(query(collection(db, 'staff'), orderBy('order'))),
        ]);

        setDestinations(destSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Destination)));
        setDepartments(deptSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Department)));
        setStaff(staffSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Staff)));
      } catch (error) {
        console.warn('フォームオプションの取得に失敗:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOptions();
  }, []);

  return { destinations, departments, staff, loading };
};

export const getStaffByStaffID = async (rawID: string): Promise<Staff | null> => {
  const padded = rawID.trim().padStart(7, '0');
  try {
    const { db } = await import('../lib/firebase');
    const q = query(collection(db, 'staff'), where('staffID', '==', padded));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    const d = snap.docs[0];
    return { id: d.id, ...d.data() } as Staff;
  } catch {
    return null;
  }
};
