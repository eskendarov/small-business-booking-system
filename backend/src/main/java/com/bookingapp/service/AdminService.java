package com.bookingapp.service;

import com.bookingapp.dto.AdminUserResponse;
import com.bookingapp.dto.AppointmentResponse;
import com.bookingapp.dto.CustomerSummaryResponse;
import com.bookingapp.exception.ResourceNotFoundException;
import com.bookingapp.model.Appointment;
import com.bookingapp.model.Customer;
import com.bookingapp.model.User;
import com.bookingapp.repository.AppointmentRepository;
import com.bookingapp.repository.BusinessRepository;
import com.bookingapp.repository.CustomerRepository;
import com.bookingapp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final BusinessRepository businessRepository;
    private final CustomerRepository customerRepository;
    private final AppointmentRepository appointmentRepository;

    public List<AdminUserResponse> getAdminUsers() {
        return userRepository.findAllByRole(User.Role.ADMIN).stream()
                .map(user -> {
                    String businessName = businessRepository.findByEmail(user.getEmail())
                            .map(b -> b.getBusinessName())
                            .orElse("—");
                    return AdminUserResponse.builder()
                            .id(user.getId())
                            .name(user.getName())
                            .email(user.getEmail())
                            .businessName(businessName)
                            .createdAt(user.getCreatedAt())
                            .build();
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteAdminUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        businessRepository.findByEmail(user.getEmail()).ifPresent(business -> {
            List<Appointment> appts = appointmentRepository.findByBusinessId(business.getId());
            appointmentRepository.deleteAll(appts);
            businessRepository.delete(business);
        });

        userRepository.delete(user);
    }

    public List<CustomerSummaryResponse> getCustomersWithAppointments() {
        return customerRepository.findAll().stream()
                .map(customer -> CustomerSummaryResponse.builder()
                        .id(customer.getId())
                        .name(customer.getName())
                        .email(customer.getEmail())
                        .phone(customer.getPhone())
                        .appointments(appointmentRepository.findByCustomerId(customer.getId()).stream()
                                .map(this::toAppointmentResponse)
                                .collect(Collectors.toList()))
                        .createdAt(customer.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteCustomer(Long customerId) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer", customerId));

        String email = customer.getEmail();
        customerRepository.delete(customer);
        userRepository.findByEmail(email).ifPresent(userRepository::delete);
    }

    private AppointmentResponse toAppointmentResponse(Appointment a) {
        return AppointmentResponse.builder()
                .id(a.getId())
                .customerId(a.getCustomer().getId())
                .customerName(a.getCustomer().getName())
                .serviceId(a.getService().getId())
                .serviceName(a.getService().getName())
                .businessId(a.getBusiness().getId())
                .businessName(a.getBusiness().getBusinessName())
                .appointmentDate(a.getAppointmentDate())
                .appointmentTime(a.getAppointmentTime())
                .status(a.getStatus())
                .notes(a.getNotes())
                .createdAt(a.getCreatedAt())
                .build();
    }
}
