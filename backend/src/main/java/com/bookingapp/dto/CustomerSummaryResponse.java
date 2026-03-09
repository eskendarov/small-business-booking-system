package com.bookingapp.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class CustomerSummaryResponse {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private List<AppointmentResponse> appointments;
    private LocalDateTime createdAt;
}
