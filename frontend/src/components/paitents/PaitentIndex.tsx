// State vs Props
import type { PatientInformation } from "../../types";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { Box } from "@mui/material";

const columns: GridColDef<PatientInformation>[] = [
  { field: "id", headerName: "ID", align: "left" },
  {
    field: "fullName",
    headerName: "Full Name",
    align: "right",
    valueGetter: (_value: never, row: PatientInformation) =>
      `${row.firstName} ${row.lastName}`,
  },
];

const PatientIndex = ({
  listOfPatients,
}: {
  listOfPatients: PatientInformation[];
}) => {
  return (
    <Box
      sx={{
        height: "500px",
      }}
    >
      <DataGrid
        columns={columns}
        rows={listOfPatients}
        pageSizeOptions={[10]}
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: 10,
            },
          },
        }}
      />
    </Box>
  );
};

export default PatientIndex;
