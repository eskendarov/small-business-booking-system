package com.bookingapp.controller;

import com.bookingapp.dto.AdminUserResponse;
import com.bookingapp.dto.AppointmentResponse;
import com.bookingapp.dto.CustomerSummaryResponse;
import com.bookingapp.dto.ServiceResponse;
import com.bookingapp.service.AdminService;
import com.bookingapp.service.AppointmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;
    private final AppointmentService appointmentService;

    @GetMapping("/appointments")
    public ResponseEntity<List<AppointmentResponse>> getAllAppointments() {
        return ResponseEntity.ok(appointmentService.getAllAppointments());
    }

    @GetMapping("/users")
    public ResponseEntity<List<AdminUserResponse>> getAdminUsers() {
        return ResponseEntity.ok(adminService.getAdminUsers());
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteAdminUser(@PathVariable Long id) {
        adminService.deleteAdminUser(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/customers")
    public ResponseEntity<List<CustomerSummaryResponse>> getCustomers() {
        return ResponseEntity.ok(adminService.getCustomersWithAppointments());
    }

    @DeleteMapping("/customers/{id}")
    public ResponseEntity<Void> deleteCustomer(@PathVariable Long id) {
        adminService.deleteCustomer(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/appointments/{id}")
    public ResponseEntity<Void> deleteAppointment(@PathVariable Long id) {
        adminService.deleteAppointment(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/users/{id}/services")
    public ResponseEntity<List<ServiceResponse>> getUserServices(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.getServicesForUser(id));
    }

    @DeleteMapping("/services/{id}")
    public ResponseEntity<Void> deleteService(@PathVariable Long id) {
        adminService.deleteService(id);
        return ResponseEntity.noContent().build();
    }
}
