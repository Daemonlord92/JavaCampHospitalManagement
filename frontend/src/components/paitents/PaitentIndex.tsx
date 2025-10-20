import type {
  PatientInformation,
  PatientInformationWithMethods,
} from "../../types";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { Box, Button } from "@mui/material";
import { useState } from "react";
import InformationModal from "../shared/InformationModal";

const columns: GridColDef<PatientInformationWithMethods>[] = [
  {
    field: "id",
    headerName: "ID",
    align: "left",
    renderCell: (params) => (
      <Button variant="text" onClick={() => params.row.handleDoctors()}>
        {params.row.id}
      </Button>
    ),
  },
  {
    field: "fullName",
    headerName: "Full Name",
    align: "right",
    width: 150,
    renderCell: (params) => (
      <Button variant="text" onClick={() => params.row.handleOpen()}>
        {`${params.row.firstName} ${params.row.lastName}`}
      </Button>
    ),
  },
];

const PatientIndex = ({
  listOfPatients = [],
  handleDoctors,
}: {
  listOfPatients: PatientInformation[];
  handleDoctors: (patientId: number) => void;
}) => {
  const [isOpen, setOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] =
    useState<PatientInformation | null>(null);

  const handleOpen = (patient: PatientInformation) => {
    setSelectedPatient(patient);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedPatient(null);
  };

  // Add handleOpen to each row for the renderCell
  const rows = listOfPatients.map((patient) => ({
    ...patient,
    handleOpen: () => handleOpen(patient),
    handleDoctors: () => handleDoctors(patient.id),
  }));

  return (
    <Box sx={{ height: "500px" }}>
      <DataGrid
        columns={columns}
        rows={rows}
        pageSizeOptions={[10]}
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: 10,
            },
          },
        }}
      />
      {selectedPatient && (
        <InformationModal
          information={selectedPatient}
          isOpen={isOpen}
          handleOpen={handleClose}
        />
      )}
    </Box>
  );
};

export default PatientIndex;
