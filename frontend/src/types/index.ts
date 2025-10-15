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
