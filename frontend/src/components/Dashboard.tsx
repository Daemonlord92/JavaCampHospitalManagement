import { useQueries, type UseQueryResult } from "@tanstack/react-query";
import { getAllDoctors, getAllPatients } from "../../api";
import { Card, Container, Typography } from "@mui/material";
import PatientIndex from "./paitents/PaitentIndex.tsx";
import type { DoctorInformation, PatientInformation } from "../types";
import DoctorIndex from "./doctors/DoctorIndex.tsx";
import { useState } from "react";

const Dashboard = () => {
  const [patients, setPatients]: PatientInformation[] = useState([]);
  const [doctors, setDoctors]: DoctorInformation[] = useState([]);
  const results = useQueries({
    queries: [
      { queryKey: ["patients"], queryFn: getAllPatients },
      { queryKey: ["doctors"], queryFn: getAllDoctors },
    ],
  }) as [
    UseQueryResult<PatientInformation[], Error>,
    UseQueryResult<DoctorInformation[], Error>,
  ];

  const [patientRes, doctorRes] = results as [
    { data?: PatientInformation[]; isLoading: boolean; error?: Error },
    { data?: DoctorInformation[]; isLoading: boolean; error?: Error },
  ];
  return (
    <Container
      sx={{
        marginTop: "1rem",
        display: "flex",
        flexDirection: "row",
        gap: "1rem",
      }}
    >
      <Card>
        {patientRes.isLoading ? (
          <Typography>Loading Patients Data....</Typography>
        ) : patientRes.error ? (
          <Typography>
            Error has occurred: {patientRes.error.message}
          </Typography>
        ) : (
          <PatientIndex
            listOfPatients={patientRes.data as PatientInformation[]}
          />
        )}
      </Card>
      <Card>
        {doctorRes.isLoading ? (
          <Typography>Loading Doctor Data....</Typography>
        ) : doctorRes.error ? (
          <Typography>Error has occurred: {doctorRes.error.message}</Typography>
        ) : (
          <DoctorIndex listOfDoctors={doctorRes.data as DoctorInformation[]} />
        )}
      </Card>
    </Container>
  );
};

export default Dashboard;
