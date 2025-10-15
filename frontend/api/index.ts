import axios, { AxiosResponse } from "axios";
import type { PatientInformation } from "../src/types";

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
