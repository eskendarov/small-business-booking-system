package com.bookingapp.repository;

import com.bookingapp.model.TimeSlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface TimeSlotRepository extends JpaRepository<TimeSlot, Long> {

    List<TimeSlot> findByServiceIdAndIsAvailableTrue(Long serviceId);

    List<TimeSlot> findByServiceIdAndDate(Long serviceId, LocalDate date);
}
