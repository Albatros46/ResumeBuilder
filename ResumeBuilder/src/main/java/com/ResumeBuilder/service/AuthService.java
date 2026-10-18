package com.ResumeBuilder.service;

import com.ResumeBuilder.documents.User;
import com.ResumeBuilder.dto.request.LoginRequest;
import com.ResumeBuilder.dto.request.RegisterRequest;
import com.ResumeBuilder.dto.response.AuthResponse;
import com.ResumeBuilder.exception.BadRequestException;
import com.ResumeBuilder.exception.EmailNotVerifiedException;
import com.ResumeBuilder.exception.InvalidCredentialsException;
import com.ResumeBuilder.exception.ResourceExistsException;
import com.ResumeBuilder.exception.ResourceNotFoundException;
import com.ResumeBuilder.repository.interfaces.UserRepository;
import com.ResumeBuilder.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final EmailService emailService;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    @Value("${app.auth.require-email-verification}")
    private boolean requireEmailVerification;

    public AuthResponse register(RegisterRequest request){
        log.info("Inside AuthService: register() {} ", request);

        String email = normalizeEmail(request.getEmail());
        if (userRepository.existsByEmail(email)) {
            throw new ResourceExistsException("User already exists with this email.");
        }

        User newUser=toDocument(request);
        newUser.setEmail(email);
        newUser = userRepository.save(newUser);

        sendVerification(newUser);

        // Dogrulama zorunlu degilse kullanici kayittan hemen sonra oturum acmis sayilir.
        String token = requireEmailVerification ? null : jwtUtil.generateToken(newUser.getId());
        return toResponse(newUser, token);
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(normalizeEmail(request.getEmail()))
                .orElseThrow(() -> new InvalidCredentialsException("Invalid email or password."));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new InvalidCredentialsException("Invalid email or password.");
        }
        if (requireEmailVerification && !user.isEmailVerified()) {
            throw new EmailNotVerifiedException("Please verify your email before logging in.");
        }

        return toResponse(user, jwtUtil.generateToken(user.getId()));
    }

    public void verifyEmail(String token) {
        User user = userRepository.findByVerificationToken(token)
                .orElseThrow(() -> new BadRequestException("Invalid or already used verification link."));

        if (user.getVerificationTokenExpires() != null
                && user.getVerificationTokenExpires().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Verification link has expired. Please request a new one.");
        }

        user.setEmailVerified(true);
        user.setVerificationToken(null);
        user.setVerificationTokenExpires(null);
        userRepository.save(user);

        emailService.sendRegistrationSuccessEmail(user.getEmail(), user.getName());
    }

    public void resendVerification(String email) {
        User user = userRepository.findByEmail(normalizeEmail(email))
                .orElseThrow(() -> new ResourceNotFoundException("User not found with this email."));

        if (user.isEmailVerified()) {
            throw new BadRequestException("Email is already verified.");
        }

        user.setVerificationToken(UUID.randomUUID().toString());
        user.setVerificationTokenExpires(LocalDateTime.now().plusHours(24));
        userRepository.save(user);

        sendVerification(user);
    }

    public AuthResponse getProfile(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));
        return toResponse(user, null);
    }

    private void sendVerification(User user) {
        String link = frontendUrl + "/verify-email?token=" + user.getVerificationToken();
        // Gelistirme ortaminda mail ulasmazsa link log'dan kopyalanabilir.
        log.info("Verification link for {}: {}", user.getEmail(), link);
        emailService.sendVerificationEmail(user.getEmail(), user.getName(), link);
    }

    private String normalizeEmail(String email) {
        return email == null ? null : email.trim().toLowerCase();
    }

    private AuthResponse toResponse(User newUser, String token){
        return AuthResponse.builder()
                .id(newUser.getId())
                .name(newUser.getName())
                .email(newUser.getEmail())
                .profileImageUrl(newUser.getProfileImageUrl())
                .emailVerified(newUser.isEmailVerified())
                .token(token)
                .subscriptionPlan(newUser.getSubscriptionPlan())
                .createdAt(newUser.getCreatedAt())
                .updatedAt(newUser.getUpdatedAt())
                .build();
    }

    private User toDocument(RegisterRequest request){
        return User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .profileImageUrl(request.getProfileImageUrl())
                .subscriptionPlan("Basic Plan")
                .emailVerified(false)
                .verificationToken(UUID.randomUUID().toString())
                .verificationTokenExpires(LocalDateTime.now().plusHours(24))
                .build();
    }
}
