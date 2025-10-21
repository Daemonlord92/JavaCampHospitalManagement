import { useFormik } from "formik";
import * as Yup from "yup";
import { type QueryClient, useMutation } from "@tanstack/react-query";
import {
  Box,
  Button,
  TextField,
  MenuItem,
  Collapse,
  Alert,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import type {
  PatientInformation,
  PostNewPatientRequest,
} from "../../types/index";
import { JSX, useState } from "react";
import { postNewPatient } from "../../../api";

const patientSchema = Yup.object({
  firstName: Yup.string()
    .required("First name is required")
    .min(2, "First name must be at least 2 characters")
    .max(150, "First name must be at most 150 characters"),
  lastName: Yup.string()
    .required("Last name is required")
    .min(2, "Last name must be at least 2 characters")
    .max(150, "Last name must be at most 150 characters"),
  dateOfBirth: Yup.date()
    .required("Date of birth is required")
    .max(new Date(), "Date of birth must be in the past or present"),
  biologicalSex: Yup.string()
    .oneOf(["MALE", "FEMALE", "INTERSEX"], "Invalid biological sex")
    .required("Biological sex is required"),
  phone: Yup.string()
    .required("Phone number is required")
    .min(10, "Phone number must be at least 10 characters")
    .max(15, "Phone number must be at most 15 characters")
    .matches(/^\+?[0-9\-\s\.\(\)]{10,15}$/, "Phone number format is invalid"),
  address: Yup.string()
    .required("Address is required")
    .min(5, "Address must be at least 5 characters")
    .max(500, "Address must be at most 500 characters"),
  allergies: Yup.string(),
});

interface PatientFormProps {
  onClose: () => void;
  queryClient: QueryClient;
}

export default function PatientForm({
  onClose,
  queryClient,
}: PatientFormProps): JSX.Element {
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [alertSeverity, setAlertSeverity] = useState<
    "success" | "error" | undefined
  >(undefined);

  const { mutate, isLoading } = useMutation<
    PatientInformation,
    Error,
    PostNewPatientRequest
  >({
    mutationFn: postNewPatient,
    mutationKey: ["patients"],
    onSuccess: (_data: PatientInformation) => {
      setAlertMessage("Patient added successfully!");
      setAlertSeverity("success");
      queryClient.invalidateQueries();
      onClose();
    },
    onError: (error) => {
      setAlertMessage(error.message || "An error occurred.");
      setAlertSeverity("error");
    },
  });

  const formik = useFormik<PostNewPatientRequest>({
    initialValues: {
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      biologicalSex: "MALE",
      phone: "",
      address: "",
      allergies: "",
    },
    validationSchema: patientSchema,
    onSubmit: async (values) => {
      mutate(values);
    },
  });

  return (
    <>
      <Collapse in={!!alertMessage}>
        <Alert
          severity={alertSeverity}
          action={
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={() => setAlertMessage(null)}
            >
              <CloseIcon fontSize="inherit" />
            </IconButton>
          }
        >
          {alertMessage}
        </Alert>
      </Collapse>
      <form onSubmit={formik.handleSubmit}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            fullWidth
            name="firstName"
            label="First Name"
            value={formik.values.firstName}
            onChange={formik.handleChange}
            error={formik.touched.firstName && Boolean(formik.errors.firstName)}
            helperText={formik.touched.firstName && formik.errors.firstName}
          />
          <TextField
            fullWidth
            name="lastName"
            label="Last Name"
            value={formik.values.lastName}
            onChange={formik.handleChange}
            error={formik.touched.lastName && Boolean(formik.errors.lastName)}
            helperText={formik.touched.lastName && formik.errors.lastName}
          />
          <TextField
            fullWidth
            name="dateOfBirth"
            label="Date of Birth"
            type="date"
            value={formik.values.dateOfBirth}
            onChange={formik.handleChange}
            error={
              formik.touched.dateOfBirth && Boolean(formik.errors.dateOfBirth)
            }
            helperText={formik.touched.dateOfBirth && formik.errors.dateOfBirth}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            fullWidth
            select
            name="biologicalSex"
            label="Biological Sex"
            value={formik.values.biologicalSex}
            onChange={formik.handleChange}
            error={
              formik.touched.biologicalSex &&
              Boolean(formik.errors.biologicalSex)
            }
            helperText={
              formik.touched.biologicalSex && formik.errors.biologicalSex
            }
          >
            <MenuItem value="MALE">Male</MenuItem>
            <MenuItem value="FEMALE">Female</MenuItem>
            <MenuItem value="INTERSEX">Intersex</MenuItem>
          </TextField>
          <TextField
            fullWidth
            name="phone"
            label="Phone"
            value={formik.values.phone}
            onChange={formik.handleChange}
            error={formik.touched.phone && Boolean(formik.errors.phone)}
            helperText={formik.touched.phone && formik.errors.phone}
          />
          <TextField
            fullWidth
            name="address"
            label="Address"
            value={formik.values.address}
            onChange={formik.handleChange}
            error={formik.touched.address && Boolean(formik.errors.address)}
            helperText={formik.touched.address && formik.errors.address}
          />
          <TextField
            fullWidth
            name="allergies"
            label="Allergies"
            value={formik.values.allergies}
            onChange={formik.handleChange}
            error={formik.touched.allergies && Boolean(formik.errors.allergies)}
            helperText={formik.touched.allergies && formik.errors.allergies}
          />

          <Box display="flex" justifyContent="space-between" mt={2}>
            <Button
              variant="contained"
              color="primary"
              type="submit"
              disabled={!formik.isValid || !formik.dirty}
            >
              Submit
            </Button>
            <Button variant="outlined" onClick={onClose}>
              Cancel
            </Button>
          </Box>
        </Box>
      </form>
    </>
  );
}
