package com.ResumeBuilder.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateResumeRequest {

    @NotBlank(message = "Title is required!")
    @Size(max = 100, message = "Title must be at most 100 characters!")
    private String title;

}
