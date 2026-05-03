package com.bookingapp.dto;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class AppointmentRequest {

    private Long customerId;

    @NotNull
    private Long serviceId;

    @NotNull
    private Long businessId;

    @NotNull
    @FutureOrPresent
    private LocalDate appointmentDate;

    @NotNull
    private LocalTime appointmentTime;

    @Size(max = 500, message = "Notes must not exceed 500 characters")
    private String notes;
}
