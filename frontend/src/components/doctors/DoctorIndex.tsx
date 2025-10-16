import type { DoctorInformation } from "../../types";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { Box, Button } from "@mui/material";
import { useState } from "react";
import InformationModal from "../shared/InformationModal";

const columns: GridColDef<DoctorInformation>[] = [
  { field: "id", headerName: "ID", align: "left" },
  {
    field: "fullName",
    headerName: "Full Name",
    align: "center",
    width: 150,
    renderCell: (params) => (
      <Button variant="text" onClick={params.row.handleOpen}>
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
  listOfDoctors,
}: {
  listOfDoctors: DoctorInformation[];
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
