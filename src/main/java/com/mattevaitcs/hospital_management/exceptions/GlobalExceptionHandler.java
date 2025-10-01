package com.mattevaitcs.hospital_management.exceptions;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.servlet.ModelAndView;

import java.time.LocalDateTime;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(value = {PatientNotFoundException.class, DoctorNotFoundException.class})
    public ModelAndView exceptionHandler(RuntimeException exception, HttpServletRequest request) {
        ModelAndView mav = new ModelAndView("error/404");
        mav.addObject("errorMessage", exception.getMessage());
        mav.addObject("requestUrl", request.getRequestURL().toString());
        mav.addObject("timestamp", LocalDateTime.now());
        mav.setStatus(HttpStatus.NOT_FOUND);
        return mav;
    }
}
