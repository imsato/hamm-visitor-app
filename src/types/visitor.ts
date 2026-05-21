export interface Visitor {
  id: string;
  name: string;
  company: string;
  department: string;
  contactDepartment?: string;
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
  checkInStaff?: string;
  checkOutStaff?: string;
  cancelCheckOutStaff?: string;
}

export interface VisitorFormInitialData {
  name: string;
  company: string;
  department: string;
  contactDepartment: string;
  contactPerson: string;
  purpose: string;
  phone: string;
  email: string;
  hasParking: boolean;
  vehicleNumber: string;
  visitorCount: number | null;
  selectedDepartmentId: string;
  isOtherSelected: boolean;
  otherPurposeText: string;
}

export interface VisitPurpose {
  id: string;
  label: string;
  category: 'meeting' | 'interview' | 'delivery' | 'maintenance' | 'other';
}

export interface Destination {
  id: string;
  name: string;
  order: number;
}

export interface Department {
  id: string;
  depname: string;
  order: number;
}

export interface Staff {
  id: string;
  staffID: string;
  staname: string;
  statitle: string | null;
  departmentId: string;
  order: number;
}
