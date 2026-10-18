package com.ResumeBuilder.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {

    @NotBlank(message = "Email is required.")
    @Email(message = "Email should be valid!")
    private String email;
    @NotBlank(message = "Name is required!")
    @Size(min = 3, max = 20, message = "Name must be between 3 and 20 characters!")
    private String name;

    @NotBlank(message = "Password is required!")
    @Size(min = 5, max = 15, message = "Password must be between 5 and 15 characters!")
    @ToString.Exclude
    private String password;
    private String profileImageUrl;

}
