export interface PatientInformation {
  id: number;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  address: string;
  dateOfBirth: string;
  biologicalSex: string;
  allergies?: string;
}

export type DoctorInformation = {
  id: number;
  firstName: string;
  lastName: string;
  department: string;
  phone: string;
  specialization: string;
  patients?: PatientInformation[];
};
