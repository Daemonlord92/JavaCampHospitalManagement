import type {
  DoctorInformation,
  DoctorInformationWithMethods,
  PatientInformation,
} from "../../types";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { Box, Button } from "@mui/material";
import { useState } from "react";
import InformationModal from "../shared/InformationModal";

const columns: GridColDef<DoctorInformationWithMethods>[] = [
  {
    field: "id",
    headerName: "ID",
    align: "left",
    renderCell: (params) => (
      <Button variant="text" onClick={() => params.row.handlePatients()}>
        {params.row.id}
      </Button>
    ),
  },
  {
    field: "fullName",
    headerName: "Full Name",
    align: "center",
    width: 150,
    renderCell: (params) => (
      <Button variant="text" onClick={() => params.row.handleOpen()}>
        {`${params.row.firstName} ${params.row.lastName}`}
      </Button>
    ),
    sortable: true,
  },
  {
    field: "specialization",
    headerName: "Specialization",
    align: "right",
    sortable: true,
  },
];

const DoctorIndex = ({
  listOfDoctors = [],
  handlePatients,
}: {
  listOfDoctors: DoctorInformation[];
  handlePatients: (patients: PatientInformation[]) => void;
}) => {
  const [isOpen, setOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] =
    useState<DoctorInformation | null>(null);

  const handleOpen = (doctor: DoctorInformation) => {
    setSelectedDoctor(doctor);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedDoctor(null);
  };

  const rows = listOfDoctors.map((doctor) => ({
    ...doctor,
    handleOpen: () => handleOpen(doctor),
    handlePatients: () =>
      handlePatients(doctor.patients as PatientInformation[]),
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
      {selectedDoctor && (
        <InformationModal
          information={selectedDoctor}
          isOpen={isOpen}
          handleOpen={handleClose}
        />
      )}
    </Box>
  );
};

export default DoctorIndex;
