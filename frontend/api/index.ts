import axios, { type AxiosResponse } from "axios";
import type { DoctorInformation, PatientInformation } from "../src/types";

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
