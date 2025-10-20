import { useFormik } from "formik";
import * as Yup from "yup";
import type { QueryClient } from "@tanstack/react-query";
import { Box, Button, TextField, MenuItem } from "@mui/material";
import type { PostNewPatientRequest } from "../../types/index";
import { JSX } from "react";

const patientSchema = Yup.object({
  firstName: Yup.string().required("Required"),
  lastName: Yup.string().required("Required"),
  dateOfBirth: Yup.string().required("Required"),
  biologicalSex: Yup.string()
    .oneOf(["MALE", "FEMALE", "INTERSEX"])
    .required("Required"),
  phone: Yup.string().required("Required"),
  address: Yup.string().required("Required"),
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
      try {
        // TODO: Call your API endpoint
        // await postNewPatient(values);
        // await queryClient.invalidateQueries({ queryKey: ["patients"] });
        console.log("Patient submission:", values);
        onClose();
      } catch (error) {
        console.error("Failed to submit patient:", error);
      }
    },
  });

  return (
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
            formik.touched.biologicalSex && Boolean(formik.errors.biologicalSex)
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
          <Button variant="contained" color="primary" type="submit">
            Submit
          </Button>
          <Button variant="outlined" onClick={onClose}>
            Cancel
          </Button>
        </Box>
      </Box>
    </form>
  );
}
