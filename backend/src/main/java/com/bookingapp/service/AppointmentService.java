package com.bookingapp.service;

import com.bookingapp.dto.AppointmentRequest;
import com.bookingapp.dto.AppointmentResponse;
import com.bookingapp.exception.ResourceNotFoundException;
import com.bookingapp.model.Appointment;
import com.bookingapp.model.Appointment.AppointmentStatus;
import com.bookingapp.model.Business;
import com.bookingapp.model.Customer;
import com.bookingapp.model.Service;
import com.bookingapp.repository.AppointmentRepository;
import com.bookingapp.repository.BusinessRepository;
import com.bookingapp.repository.CustomerRepository;
import com.bookingapp.repository.ServiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@org.springframework.stereotype.Service
@RequiredArgsConstructor
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final CustomerRepository customerRepository;
    private final ServiceRepository serviceRepository;
    private final BusinessRepository businessRepository;

    @Transactional
    public AppointmentResponse createAppointment(AppointmentRequest request) {
        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer", request.getCustomerId()));

        Service service = serviceRepository.findById(request.getServiceId())
                .orElseThrow(() -> new ResourceNotFoundException("Service", request.getServiceId()));

        Business business = businessRepository.findById(request.getBusinessId())
                .orElseThrow(() -> new ResourceNotFoundException("Business", request.getBusinessId()));

        Appointment appointment = Appointment.builder()
                .customer(customer)
                .service(service)
                .business(business)
                .appointmentDate(request.getAppointmentDate())
                .appointmentTime(request.getAppointmentTime())
                .status(AppointmentStatus.PENDING)
                .notes(request.getNotes())
                .build();

        return toResponse(appointmentRepository.save(appointment));
    }

    public AppointmentResponse getAppointmentById(Long id) {
        return toResponse(appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", id)));
    }

    public List<AppointmentResponse> getAllAppointments() {
        return appointmentRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<AppointmentResponse> getAppointmentsByBusiness(Long businessId) {
        return appointmentRepository.findByBusinessId(businessId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public AppointmentResponse updateStatus(Long id, AppointmentStatus status) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", id));
        appointment.setStatus(status);
        return toResponse(appointmentRepository.save(appointment));
    }

    @Transactional
    public void deleteAppointment(Long id) {
        if (!appointmentRepository.existsById(id)) {
            throw new ResourceNotFoundException("Appointment", id);
        }
        appointmentRepository.deleteById(id);
    }

    private AppointmentResponse toResponse(Appointment a) {
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
