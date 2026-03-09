package com.bookingapp.controller;

import com.bookingapp.dto.BusinessResponse;
import com.bookingapp.dto.ServiceInput;
import com.bookingapp.dto.ServiceResponse;
import com.bookingapp.model.Business;
import com.bookingapp.model.Service;
import com.bookingapp.repository.BusinessRepository;
import com.bookingapp.repository.ServiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
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

    @GetMapping("/my")
    public ResponseEntity<BusinessResponse> getMyBusiness(@AuthenticationPrincipal UserDetails userDetails) {
        return businessRepository.findByEmail(userDetails.getUsername())
                .map(this::toResponse)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/services")
    public ResponseEntity<List<ServiceResponse>> getServices(@PathVariable Long id) {
        List<ServiceResponse> list = serviceRepository.findByBusinessId(id).stream()
                .map(this::toServiceResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }

    @PostMapping("/my/services")
    public ResponseEntity<ServiceResponse> addService(
            @RequestBody ServiceInput input,
            @AuthenticationPrincipal UserDetails userDetails) {
        return businessRepository.findByEmail(userDetails.getUsername())
                .map(business -> {
                    Service service = Service.builder()
                            .name(input.getName())
                            .description(input.getDescription())
                            .durationMinutes(input.getDurationMinutes())
                            .price(input.getPrice())
                            .business(business)
                            .build();
                    return ResponseEntity.status(HttpStatus.CREATED)
                            .body(toServiceResponse(serviceRepository.save(service)));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/my/services/{serviceId}")
    public ResponseEntity<Void> deleteService(
            @PathVariable Long serviceId,
            @AuthenticationPrincipal UserDetails userDetails) {
        return businessRepository.findByEmail(userDetails.getUsername())
                .flatMap(business -> serviceRepository.findById(serviceId)
                        .filter(s -> s.getBusiness().getId().equals(business.getId())))
                .map(s -> {
                    serviceRepository.deleteById(serviceId);
                    return ResponseEntity.noContent().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
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
