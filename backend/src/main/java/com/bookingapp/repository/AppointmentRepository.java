package com.bookingapp.repository;

import com.bookingapp.model.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    List<Appointment> findByCustomerId(Long customerId);

    List<Appointment> findByBusinessId(Long businessId);

    List<Appointment> findByBusinessIdAndAppointmentDate(Long businessId, LocalDate date);

    List<Appointment> findByServiceId(Long serviceId);
}
