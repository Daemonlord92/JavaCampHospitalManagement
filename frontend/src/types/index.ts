export type PatientInformation = {
  id: number;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  address: string;
  dateOfBirth: string;
  biologicalSex: string;
  allergies?: string;
};

export type PatientInformationWithMethods = PatientInformation & {
  handleOpen: () => void;
  handleDoctors: () => void;
};

export type DoctorInformation = {
  id: number;
  firstName: string;
  lastName: string;
  department: string;
  phone: string;
  specialization: string;
  patients?: PatientInformation[];
};

export type DoctorInformationWithMethods = DoctorInformation & {
  handleOpen: () => void;
  handlePatients: () => void;
};

export type PostNewPatientRequest = {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  biologicalSex: "MALE" | "FEMALE" | "INTERSEX";
  phone: string;
  address: string;
  allergies: string;
};

export type PostNewDoctorRequest = {
  firstName: string;
  lastName: string;
  department: string;
  phone: string;
  specialization: string;
};

export type AuthRequest = {
  email: string;
  password: string;
};
