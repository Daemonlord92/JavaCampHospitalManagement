import type { DoctorInformation, PatientInformation } from "../../types";
import { Box, Card, Modal, Typography } from "@mui/material";

const InformationModal = ({
  information,
  isOpen,
  handleOpen,
}: {
  information: PatientInformation | DoctorInformation;
  isOpen: boolean;
  handleOpen: () => void;
}) => {
  if ("phoneNumber" in information) {
    // Patient modal
    return (
      <Modal open={isOpen} onClose={handleOpen}>
        <Box>
          <Card>
            <Typography component="h3">
              Patient Name: {information.firstName} {information.lastName}
            </Typography>
            <Typography component="h4">
              Phone Number: {information.phoneNumber}
            </Typography>
            <Typography>Address: {information.address}</Typography>
            <Typography>Date of Birth: {information.dateOfBirth}</Typography>
            <Typography>Sex: {information.biologicalSex}</Typography>
            <Typography>Allergies: {information.allergies || "N/A"}</Typography>
          </Card>
        </Box>
      </Modal>
    );
  } else {
    // Doctor modal (no ID)
    return (
      <Modal open={isOpen} onClose={handleOpen}>
        <Box>
          <Card>
            <Typography component="h3">
              Doctor Name: {information.firstName} {information.lastName}
            </Typography>
            <Typography>Department: {information.department}</Typography>
            <Typography>Phone: {information.phone}</Typography>
            <Typography>
              Specialization: {information.specialization}
            </Typography>
          </Card>
        </Box>
      </Modal>
    );
  }
};

export default InformationModal;
