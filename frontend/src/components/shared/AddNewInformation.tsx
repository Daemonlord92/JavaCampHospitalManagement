import { type JSX, useState } from "react";
import { Modal, Box, Tabs, Tab } from "@mui/material";
import type { QueryClient } from "@tanstack/react-query";
import PatientForm from "./PatientForm";
import DoctorForm from "./DoctorForm";

const modalStyle = {
  position: "absolute" as const,
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  borderRadius: 2,
  boxShadow: 24,
  p: 4,
};

interface AddNewInformationProps {
  open: boolean;
  setOpen: (arg: boolean) => void;
  queryClient: QueryClient;
}

export default function AddNewInformation({
  open,
  setOpen,
  queryClient,
}: AddNewInformationProps): JSX.Element {
  const [activeTab, setActiveTab] = useState<number>(0);

  const handleClose = () => {
    setOpen(false);
    // Reset to patient tab when closing
    setActiveTab(0);
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={modalStyle}>
        <Tabs value={activeTab} onChange={(_, value) => setActiveTab(value)}>
          <Tab label="Patient" />
          <Tab label="Doctor" />
        </Tabs>

        <Box sx={{ mt: 2 }}>
          {activeTab === 0 ? (
            <PatientForm onClose={handleClose} queryClient={queryClient} />
          ) : (
            <DoctorForm onClose={handleClose} queryClient={queryClient} />
          )}
        </Box>
      </Box>
    </Modal>
  );
}
