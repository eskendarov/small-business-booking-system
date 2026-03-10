package com.bookingapp.repository;

import com.bookingapp.model.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    List<Appointment> findByCustomerId(Long customerId);

    List<Appointment> findByBusinessId(Long businessId);

    List<Appointment> findByBusinessIdAndAppointmentDate(Long businessId, LocalDate date);

    List<Appointment> findByServiceId(Long serviceId);

    @Query("SELECT a FROM Appointment a JOIN FETCH a.customer JOIN FETCH a.service JOIN FETCH a.business WHERE a.id = :id")
    Optional<Appointment> findByIdFetching(@Param("id") Long id);

    @Query("SELECT a FROM Appointment a JOIN FETCH a.customer JOIN FETCH a.service JOIN FETCH a.business WHERE a.customer.id = :customerId")
    List<Appointment> findByCustomerIdFetching(@Param("customerId") Long customerId);

    @Query("SELECT a FROM Appointment a JOIN FETCH a.customer JOIN FETCH a.service JOIN FETCH a.business WHERE a.business.id = :businessId")
    List<Appointment> findByBusinessIdFetching(@Param("businessId") Long businessId);

    @Query("SELECT a FROM Appointment a JOIN FETCH a.customer JOIN FETCH a.service JOIN FETCH a.business")
    List<Appointment> findAllFetching();
}
