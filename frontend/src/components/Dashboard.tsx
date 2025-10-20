import {
  useQueries,
  useQueryClient,
  type UseQueryResult,
} from "@tanstack/react-query";
import { getAllDoctors, getAllPatients } from "../../api";
import { Box, Button, Card, Container, Typography } from "@mui/material";
import PatientIndex from "./paitents/PaitentIndex.tsx";
import type { DoctorInformation, PatientInformation } from "../types";
import DoctorIndex from "./doctors/DoctorIndex.tsx";
import { useEffect, useState } from "react";
import AddNewInformation from "./shared/AddNewInformation.tsx";

const Dashboard = () => {
  const [patients, setPatients] = useState<PatientInformation[]>([]);
  const [doctors, setDoctors] = useState<DoctorInformation[]>([]);
  const [open, setOpen] = useState<boolean>(false);

  const queryClient = useQueryClient();

  const results = useQueries({
    queries: [
      { queryKey: ["patients"], queryFn: getAllPatients },
      { queryKey: ["doctors"], queryFn: getAllDoctors },
    ],
  }) as [
    UseQueryResult<PatientInformation[], Error>,
    UseQueryResult<DoctorInformation[], Error>,
  ];

  const handleDoctor = (patientId: number): void => {
    const doctorList =
      doctorRes.data?.filter((doctor) =>
        doctor.patients?.some((patient) => patient.id === patientId),
      ) ?? [];
    console.table(doctorList);
    setDoctors(doctorList);
  };

  const handlePatients = (patients: PatientInformation[]) => {
    setPatients(patients);
  };

  const resetLists = () => {
    setDoctors(doctorRes.data ?? []);
    setPatients(patientRes.data ?? []);
  };

  const [patientRes, doctorRes] = results as [
    { data?: PatientInformation[]; isLoading: boolean; error?: Error },
    { data?: DoctorInformation[]; isLoading: boolean; error?: Error },
  ];

  useEffect(() => {
    setPatients(patientRes.data as PatientInformation[]);
    setDoctors(doctorRes.data as DoctorInformation[]);
  }, [doctorRes.data, patientRes.data]);

  return (
    <>
      <Container
        sx={{
          marginTop: "1rem",
          display: "flex",
          flexDirection: "row",
          gap: "1rem",
          flexWrap: "wrap",
        }}
      >
        <Box
          sx={{
            maxWidth: "100%",
            width: "100%",
          }}
        >
          <Button variant="text" onClick={() => resetLists()}>
            Reset Lists
          </Button>
          <Button
            variant="text"
            onClick={() => {
              setOpen(true);
            }}
          >
            Add Information
          </Button>
        </Box>
        <Card>
          {patientRes.isLoading ? (
            <Typography>Loading Patients Data....</Typography>
          ) : patientRes.error ? (
            <Typography>
              Error has occurred: {patientRes.error.message}
            </Typography>
          ) : (
            <PatientIndex
              listOfPatients={patients}
              handleDoctors={handleDoctor}
            />
          )}
        </Card>
        <Card>
          {doctorRes.isLoading ? (
            <Typography>Loading Doctor Data....</Typography>
          ) : doctorRes.error ? (
            <Typography>
              Error has occurred: {doctorRes.error.message}
            </Typography>
          ) : (
            <DoctorIndex
              listOfDoctors={doctors}
              handlePatients={handlePatients}
            />
          )}
        </Card>
      </Container>
      <AddNewInformation
        open={open}
        setOpen={setOpen}
        queryClient={queryClient}
      />
    </>
  );
};

export default Dashboard;
