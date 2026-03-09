package com.bookingapp.config;

import com.bookingapp.model.Business;
import com.bookingapp.model.Service;
import com.bookingapp.model.User;
import com.bookingapp.repository.BusinessRepository;
import com.bookingapp.repository.ServiceRepository;
import com.bookingapp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
@RequiredArgsConstructor
public class DataInitializer implements ApplicationRunner {

    private final BusinessRepository businessRepository;
    private final ServiceRepository serviceRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(ApplicationArguments args) {
        if (!userRepository.existsByEmail("admin")) {
            userRepository.save(User.builder()
                    .name("Super Admin")
                    .email("admin")
                    .password(passwordEncoder.encode("admin"))
                    .role(User.Role.SUPER_ADMIN)
                    .build());
        }

        if (businessRepository.count() > 0) return;

        Business salon = businessRepository.save(Business.builder()
                .businessName("Glamour Hair Salon")
                .ownerName("Anna Smith")
                .email("salon@example.com")
                .phone("+1-555-0101")
                .address("123 Main St, New York")
                .build());

        serviceRepository.save(Service.builder()
                .name("Haircut")
                .description("Professional haircut and styling")
                .durationMinutes(45)
                .price(new BigDecimal("35.00"))
                .business(salon)
                .build());

        serviceRepository.save(Service.builder()
                .name("Hair Coloring")
                .description("Full color treatment")
                .durationMinutes(120)
                .price(new BigDecimal("85.00"))
                .business(salon)
                .build());

        serviceRepository.save(Service.builder()
                .name("Manicure")
                .description("Classic manicure with polish")
                .durationMinutes(30)
                .price(new BigDecimal("25.00"))
                .business(salon)
                .build());

        Business spa = businessRepository.save(Business.builder()
                .businessName("Zen Wellness Spa")
                .ownerName("David Lee")
                .email("spa@example.com")
                .phone("+1-555-0202")
                .address("456 Park Ave, New York")
                .build());

        serviceRepository.save(Service.builder()
                .name("Swedish Massage")
                .description("Relaxing full-body massage")
                .durationMinutes(60)
                .price(new BigDecimal("70.00"))
                .business(spa)
                .build());

        serviceRepository.save(Service.builder()
                .name("Deep Tissue Massage")
                .description("Therapeutic deep tissue work")
                .durationMinutes(90)
                .price(new BigDecimal("95.00"))
                .business(spa)
                .build());

        serviceRepository.save(Service.builder()
                .name("Facial Treatment")
                .description("Rejuvenating skin facial")
                .durationMinutes(60)
                .price(new BigDecimal("60.00"))
                .business(spa)
                .build());
    }
}
