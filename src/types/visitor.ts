export interface Visitor {
  id: string;
  name: string;
  company: string;
  department: string;
  contactPerson: string;
  purpose: string;
  phone: string;
  email: string;
  visitorCount: number;
  hasParking: boolean;
  vehicleNumber?: string;
  checkInTime: Date;
  checkOutTime?: Date;
  status: 'checked-in' | 'checked-out';
  badgeNumber?: string;
}

export interface VisitPurpose {
  id: string;
  label: string;
  category: 'meeting' | 'interview' | 'delivery' | 'maintenance' | 'other';
}