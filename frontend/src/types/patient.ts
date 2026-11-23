export interface PatientProfile {
  patientId: string;
  fullName: string;
  age: number;
  gender: 'Female' | 'Male' | 'Other';
  admissionDate: string;
  roomBed: string;
  assignedDeviceId: string;
  assignedDoctor: string;
}

export interface DoctorProfile {
  doctorId: string;
  fullName: string;
  title: string;
  department: string;
  hospital: string;
  email: string;
}
