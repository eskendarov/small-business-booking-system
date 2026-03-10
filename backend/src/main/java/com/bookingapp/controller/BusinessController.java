package com.bookingapp.controller;

import com.bookingapp.dto.BusinessResponse;
import com.bookingapp.dto.ServiceInput;
import com.bookingapp.dto.ServiceResponse;
import com.bookingapp.service.BusinessService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/businesses")
@RequiredArgsConstructor
public class BusinessController {

    private final BusinessService businessService;

    @GetMapping
    public ResponseEntity<List<BusinessResponse>> getAll() {
        return ResponseEntity.ok(businessService.getAllBusinesses());
    }

    @GetMapping("/my")
    public ResponseEntity<BusinessResponse> getMyBusiness(@AuthenticationPrincipal UserDetails userDetails) {
        return businessService.getMyBusiness(userDetails.getUsername())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/services")
    public ResponseEntity<List<ServiceResponse>> getServices(@PathVariable Long id) {
        return ResponseEntity.ok(businessService.getServicesForBusiness(id));
    }

    @PostMapping("/my/services")
    public ResponseEntity<ServiceResponse> addService(
            @RequestBody ServiceInput input,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(businessService.addService(input, userDetails.getUsername()));
    }

    @DeleteMapping("/my/services/{serviceId}")
    public ResponseEntity<Void> deleteService(
            @PathVariable Long serviceId,
            @AuthenticationPrincipal UserDetails userDetails) {
        boolean deleted = businessService.deleteService(serviceId, userDetails.getUsername());
        return deleted ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }
}
