package com.bookingapp.service;

import com.bookingapp.dto.AdminUserResponse;
import com.bookingapp.dto.AppointmentResponse;
import com.bookingapp.dto.CustomerSummaryResponse;
import com.bookingapp.dto.ServiceResponse;
import com.bookingapp.exception.ResourceNotFoundException;
import com.bookingapp.model.Appointment;
import com.bookingapp.model.Customer;
import com.bookingapp.model.User;
import com.bookingapp.repository.AppointmentRepository;
import com.bookingapp.repository.BusinessRepository;
import com.bookingapp.repository.CustomerRepository;
import com.bookingapp.repository.ServiceRepository;
import com.bookingapp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final BusinessRepository businessRepository;
    private final CustomerRepository customerRepository;
    private final AppointmentRepository appointmentRepository;
    private final ServiceRepository serviceRepository;
    private final BusinessService businessService;

    public List<AdminUserResponse> getAdminUsers() {
        List<User> admins = userRepository.findAllByRole(User.Role.ADMIN);

        // Load all businesses in one query and build an email → businessName lookup
        Map<String, String> emailToBusinessName = businessRepository.findAll().stream()
                .collect(Collectors.toMap(b -> b.getEmail(), b -> b.getBusinessName()));

        return admins.stream()
                .map(user -> AdminUserResponse.builder()
                        .id(user.getId())
                        .name(user.getName())
                        .email(user.getEmail())
                        .businessName(emailToBusinessName.getOrDefault(user.getEmail(), "—"))
                        .createdAt(user.getCreatedAt())
                        .build())
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
        List<Customer> customers = customerRepository.findAll();

        // Load all appointments in one JOIN FETCH query and group by customer id
        Map<Long, List<Appointment>> byCustomerId = appointmentRepository.findAllFetching().stream()
                .collect(Collectors.groupingBy(a -> a.getCustomer().getId()));

        return customers.stream()
                .map(customer -> CustomerSummaryResponse.builder()
                        .id(customer.getId())
                        .name(customer.getName())
                        .email(customer.getEmail())
                        .phone(customer.getPhone())
                        .appointments(
                                byCustomerId.getOrDefault(customer.getId(), List.of()).stream()
                                        .map(this::toAppointmentResponse)
                                        .collect(Collectors.toList()))
                        .createdAt(customer.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteAppointment(Long appointmentId) {
        if (!appointmentRepository.existsById(appointmentId)) {
            throw new ResourceNotFoundException("Appointment", appointmentId);
        }
        appointmentRepository.deleteById(appointmentId);
    }

    public List<ServiceResponse> getServicesForUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        return businessRepository.findByEmail(user.getEmail())
                .map(business -> businessService.getServicesForBusiness(business.getId()))
                .orElseGet(List::of);
    }

    @Transactional
    public void deleteService(Long serviceId) {
        if (!serviceRepository.existsById(serviceId)) {
            throw new ResourceNotFoundException("Service", serviceId);
        }
        appointmentRepository.deleteAll(appointmentRepository.findByServiceId(serviceId));
        serviceRepository.deleteById(serviceId);
    }

    @Transactional
    public void deleteCustomer(Long customerId) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer", customerId));

        // Explicitly delete appointments before removing the customer record
        appointmentRepository.deleteAll(appointmentRepository.findByCustomerId(customerId));

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
