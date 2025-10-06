package com.mattevaitcs.hospital_management;

import com.mattevaitcs.hospital_management.exceptions.PatientNotFoundException;
import com.mattevaitcs.hospital_management.repositories.PatientRepository;
import com.mattevaitcs.hospital_management.services.PatientServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class PatientServiceTests {
    @Mock
    private PatientRepository patientRepository;

    @InjectMocks
    private PatientServiceImpl patientService;

    @Test
    void testDeletePatientByIdSuccessTestShouldDelete() {
        long patientId = 1l;

        patientService.deletePatientById(patientId);

        verify(patientRepository, times(1)).deleteById(patientId);
    }

    @Test
    void testDeletePatientByIdInvalidIdShouldThrowException() {
        long id = anyLong();

        when(patientRepository.existsById(id)).thenReturn(false);

        PatientNotFoundException exception = assertThrows(
                PatientNotFoundException.class,
                () -> patientService.deletePatientById(id)
        );

        assertEquals("Patient with id of " + id + " not found!", exception.getMessage());
        verify(patientRepository, times(1)).existsById(id);
        verify(patientRepository, never()).deleteById(id);
    }
}
