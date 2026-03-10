package com.bookingapp.service;

import com.bookingapp.dto.BusinessResponse;
import com.bookingapp.dto.ServiceInput;
import com.bookingapp.dto.ServiceResponse;
import com.bookingapp.exception.ResourceNotFoundException;
import com.bookingapp.model.Business;
import com.bookingapp.model.Service;
import com.bookingapp.repository.BusinessRepository;
import com.bookingapp.repository.ServiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@org.springframework.stereotype.Service
@RequiredArgsConstructor
public class BusinessService {

    private final BusinessRepository businessRepository;
    private final ServiceRepository serviceRepository;

    public List<BusinessResponse> getAllBusinesses() {
        return businessRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public Optional<BusinessResponse> getMyBusiness(String email) {
        return businessRepository.findByEmail(email).map(this::toResponse);
    }

    public List<ServiceResponse> getServicesForBusiness(Long businessId) {
        return serviceRepository.findByBusinessId(businessId).stream()
                .map(this::toServiceResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public ServiceResponse addService(ServiceInput input, String ownerEmail) {
        Business business = businessRepository.findByEmail(ownerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Business for email", 0L));
        Service service = Service.builder()
                .name(input.getName())
                .description(input.getDescription())
                .durationMinutes(input.getDurationMinutes())
                .price(input.getPrice())
                .business(business)
                .build();
        return toServiceResponse(serviceRepository.save(service));
    }

    @Transactional
    public boolean deleteService(Long serviceId, String ownerEmail) {
        return businessRepository.findByEmail(ownerEmail)
                .flatMap(business -> serviceRepository.findById(serviceId)
                        .filter(s -> s.getBusiness().getId().equals(business.getId())))
                .map(s -> {
                    serviceRepository.deleteById(s.getId());
                    return true;
                })
                .orElse(false);
    }

    public BusinessResponse toResponse(Business b) {
        return BusinessResponse.builder()
                .id(b.getId())
                .businessName(b.getBusinessName())
                .ownerName(b.getOwnerName())
                .email(b.getEmail())
                .phone(b.getPhone())
                .address(b.getAddress())
                .build();
    }

    public ServiceResponse toServiceResponse(Service s) {
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
