package com.bookingapp.service;

import com.bookingapp.config.JwtUtil;
import com.bookingapp.dto.AuthRequest;
import com.bookingapp.dto.AuthResponse;
import com.bookingapp.dto.RegisterRequest;
import com.bookingapp.dto.ServiceInput;
import com.bookingapp.model.Business;
import com.bookingapp.model.User;
import com.bookingapp.repository.BusinessRepository;
import com.bookingapp.repository.ServiceRepository;
import com.bookingapp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final BusinessRepository businessRepository;
    private final ServiceRepository serviceRepository;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already in use");
        }

        User.Role role = (request.getRole() != null) ? request.getRole() : User.Role.CUSTOMER;

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .build();

        userRepository.save(user);

        if (role == User.Role.ADMIN) {
            String bizName = (request.getBusinessName() != null && !request.getBusinessName().isBlank())
                    ? request.getBusinessName()
                    : request.getName() + "'s Business";

            Business business = Business.builder()
                    .businessName(bizName)
                    .ownerName(request.getName())
                    .email(request.getEmail())
                    .build();
            businessRepository.save(business);

            List<ServiceInput> inputs = request.getServices();
            if (inputs != null) {
                for (ServiceInput si : inputs) {
                    com.bookingapp.model.Service service = com.bookingapp.model.Service.builder()
                            .name(si.getName())
                            .description(si.getDescription())
                            .durationMinutes(si.getDurationMinutes())
                            .price(si.getPrice())
                            .business(business)
                            .build();
                    serviceRepository.save(service);
                }
            }
        }

        String token = jwtUtil.generateToken(user.getEmail());
        return new AuthResponse(token, user.getEmail(), user.getRole().name());
    }

    public AuthResponse login(AuthRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        String token = jwtUtil.generateToken(user.getEmail());
        return new AuthResponse(token, user.getEmail(), user.getRole().name());
    }
}
