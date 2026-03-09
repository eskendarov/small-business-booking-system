package com.bookingapp.controller;

import com.bookingapp.dto.BusinessResponse;
import com.bookingapp.dto.ServiceResponse;
import com.bookingapp.model.Business;
import com.bookingapp.model.Service;
import com.bookingapp.repository.BusinessRepository;
import com.bookingapp.repository.ServiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/businesses")
@RequiredArgsConstructor
public class BusinessController {

    private final BusinessRepository businessRepository;
    private final ServiceRepository serviceRepository;

    @GetMapping
    public ResponseEntity<List<BusinessResponse>> getAll() {
        List<BusinessResponse> list = businessRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }

    @GetMapping("/{id}/services")
    public ResponseEntity<List<ServiceResponse>> getServices(@PathVariable Long id) {
        List<ServiceResponse> list = serviceRepository.findByBusinessId(id).stream()
                .map(this::toServiceResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }

    private BusinessResponse toResponse(Business b) {
        return BusinessResponse.builder()
                .id(b.getId())
                .businessName(b.getBusinessName())
                .ownerName(b.getOwnerName())
                .email(b.getEmail())
                .phone(b.getPhone())
                .address(b.getAddress())
                .build();
    }

    private ServiceResponse toServiceResponse(Service s) {
        return ServiceResponse.builder()
                .id(s.getId())
                .name(s.getName())
                .description(s.getDescription())
                .durationMinutes(s.getDurationMinutes())
                .price(s.getPrice())
                .businessId(s.getBusiness().getId())
                .build();
    }
}
