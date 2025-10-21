import axios, { type AxiosResponse } from "axios";
import type {
  DoctorInformation,
  PatientInformation,
  PostNewPatientRequest,
} from "../src/types";

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

export const getAllPatients = async (): Promise<PatientInformation[]> => {
  const response: AxiosResponse<PatientInformation[]> =
    await axiosInstance.get("/patient/");
  console.table(response);
  if (response.status !== 200) {
    throw new Error("An error has occurred while fetching the data");
  }
  return response.data;
};

export const getAllDoctors = async (): Promise<DoctorInformation[]> => {
  const response: AxiosResponse<DoctorInformation[]> =
    await axiosInstance.get("/doctor/");
  if (response.status !== 200)
    throw new Error("An error has occurred while fetching doctor data");
  return response.data;
};

export const postNewPatient = async (data: PostNewPatientRequest) => {
  const response: AxiosResponse<PatientInformation> = await axiosInstance.post(
    "/patient/add-patient",
    data,
  );
  if (response.status !== 201)
    throw new Error(
      "An error has occurred while posting new patient " + response.statusText,
    );
  return response.data;
};
