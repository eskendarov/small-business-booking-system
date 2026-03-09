package com.bookingapp.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class ServiceInput {
    private String name;
    private String description;
    private Integer durationMinutes;
    private BigDecimal price;
}
