import { useFormik } from "formik";
import * as Yup from "yup";
import type { QueryClient } from "@tanstack/react-query";
import { Box, Button, TextField } from "@mui/material";
import type { PostNewDoctorRequest } from "../../types/index";
import { type JSX } from "react";

const doctorSchema = Yup.object({
  firstName: Yup.string().required("Required"),
  lastName: Yup.string().required("Required"),
  department: Yup.string().required("Required"),
  phone: Yup.string().required("Required"),
  specialization: Yup.string().required("Required"),
});

interface DoctorFormProps {
  onClose: () => void;
  queryClient: QueryClient;
}

export default function DoctorForm({
  onClose,
  queryClient,
}: DoctorFormProps): JSX.Element {
  const formik = useFormik<PostNewDoctorRequest>({
    initialValues: {
      firstName: "",
      lastName: "",
      department: "",
      phone: "",
      specialization: "",
    },
    validationSchema: doctorSchema,
    onSubmit: async (values) => {
      try {
        // TODO: Call your API endpoint
        // await postNewDoctor(values);
        // await queryClient.invalidateQueries({ queryKey: ["doctors"] });
        console.log("Doctor submission:", values);
        onClose();
      } catch (error) {
        console.error("Failed to submit doctor:", error);
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
          name="department"
          label="Department"
          value={formik.values.department}
          onChange={formik.handleChange}
          error={formik.touched.department && Boolean(formik.errors.department)}
          helperText={formik.touched.department && formik.errors.department}
        />
        <TextField
          fullWidth
          name="specialization"
          label="Specialization"
          value={formik.values.specialization}
          onChange={formik.handleChange}
          error={
            formik.touched.specialization &&
            Boolean(formik.errors.specialization)
          }
          helperText={
            formik.touched.specialization && formik.errors.specialization
          }
        />
        <TextField
          fullWidth
          name="phone"
          label="Phone"
          value={formik.values.phone}
          onChange={formik.handleChange}
          error={formik.touched.phone && Boolean(formik.errors.phone)}
          helperText={formik.touched.phone && formik.errors.phone}
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
