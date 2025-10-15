import { useQuery } from "@tanstack/react-query";
import { getAllPatients } from "../../api";
import { Card, Container, Typography } from "@mui/material";
import PatientIndex from "./paitents/PaitentIndex.tsx";
import type { PatientInformation } from "../types";

const Dashboard = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["patients"],
    queryFn: getAllPatients,
  });

  if (isLoading)
    return (
      <Container>
        <Typography>Loading Patients Data....</Typography>
      </Container>
    );
  if (error)
    return (
      <Container>
        <Typography>Error has occurred: {error.message}</Typography>
      </Container>
    );
  console.table(data);
  return (
    <Container
      sx={{
        marginTop: "1rem",
      }}
    >
      <Card>
        <PatientIndex listOfPatients={data as PatientInformation[]} />
      </Card>
    </Container>
  );
};

export default Dashboard;
