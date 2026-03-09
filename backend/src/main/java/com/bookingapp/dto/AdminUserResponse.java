package com.bookingapp.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class AdminUserResponse {
    private Long id;
    private String name;
    private String email;
    private String businessName;
    private LocalDateTime createdAt;
}
