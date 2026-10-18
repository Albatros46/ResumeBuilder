package com.ResumeBuilder.controller;

import com.ResumeBuilder.dto.request.LoginRequest;
import com.ResumeBuilder.dto.request.RegisterRequest;
import com.ResumeBuilder.dto.request.ResendVerificationRequest;
import com.ResumeBuilder.dto.response.AuthResponse;
import com.ResumeBuilder.dto.response.MessageResponse;
import com.ResumeBuilder.dto.response.UploadResponse;
import com.ResumeBuilder.service.AuthService;
import com.ResumeBuilder.service.FileStorageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequiredArgsConstructor
@Slf4j
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final FileStorageService fileStorageService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        log.info("Kullanıcı kaydedildi, doğrulama maili kuyruğa alındı: {}", response.getEmail());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @GetMapping("/verify-email")
    public ResponseEntity<MessageResponse> verifyEmail(@RequestParam String token) {
        authService.verifyEmail(token);
        return ResponseEntity.ok(new MessageResponse("Email verified successfully. You can now login."));
    }

    @PostMapping("/resend-verification")
    public ResponseEntity<MessageResponse> resendVerification(@Valid @RequestBody ResendVerificationRequest request) {
        authService.resendVerification(request.getEmail());
        return ResponseEntity.ok(new MessageResponse("Verification email sent."));
    }

    @GetMapping("/profile")
    public ResponseEntity<AuthResponse> profile(@AuthenticationPrincipal String userId) {
        return ResponseEntity.ok(authService.getProfile(userId));
    }

    @PostMapping(value = "/upload-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<UploadResponse> uploadImage(@RequestPart("image") MultipartFile image) {
        return ResponseEntity.ok(new UploadResponse(fileStorageService.storeImage(image)));
    }

}
