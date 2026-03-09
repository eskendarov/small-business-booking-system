package com.bookingapp.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class BusinessResponse {
    private Long id;
    private String businessName;
    private String ownerName;
    private String email;
    private String phone;
    private String address;
}
