import axios, { type AxiosResponse } from "axios";
import type {
  AuthRequest,
  DoctorInformation,
  PatientInformation,
  PostNewPatientRequest,
} from "../src/types";

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    Authorization: "Bearer " + sessionStorage.getItem("jwt") || "",
  },
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

export const login = async (data: AuthRequest) => {
  const response: AxiosResponse<string> = await axiosInstance.post(
    "/auth/login",
    data,
  );
  if (response.status !== 200) throw new Error("Invalid username/password");

  return response.data;
};
