package com.ResumeBuilder.documents;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "resumes")
public class Resume {
    @Id
    private String id;
    @Indexed
    private String userId;
    private String title;
    private String thumbnailLink;

    @Builder.Default
    private Template template = new Template();
    @Builder.Default
    private ProfileInfo profileInfo = new ProfileInfo();
    @Builder.Default
    private ContactInfo contactInfo = new ContactInfo();
    @Builder.Default
    private List<WorkExperience> workExperience = new ArrayList<>();
    @Builder.Default
    private List<Education> education = new ArrayList<>();
    @Builder.Default
    private List<Skill> skills = new ArrayList<>();
    @Builder.Default
    private List<Project> projects = new ArrayList<>();
    @Builder.Default
    private List<Certification> certifications = new ArrayList<>();
    @Builder.Default
    private List<Language> languages = new ArrayList<>();
    @Builder.Default
    private List<String> interests = new ArrayList<>();

    @CreatedDate
    private LocalDateTime createdAt;
    @LastModifiedDate
    private LocalDateTime updatedAt;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Template {
        private String theme = "classic";
        private String colorPalette = "#2563eb";
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProfileInfo {
        private String profilePreviewUrl;
        private String fullName;
        private String designation;
        private String summary;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ContactInfo {
        private String email;
        private String phone;
        private String location;
        private String linkedIn;
        private String github;
        private String website;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WorkExperience {
        private String company;
        private String role;
        private String startDate;
        private String endDate;
        private String description;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Education {
        private String degree;
        private String institution;
        private String startDate;
        private String endDate;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Skill {
        private String name;
        private Integer progress;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Project {
        private String title;
        private String description;
        private String github;
        private String liveDemo;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Certification {
        private String title;
        private String issuer;
        private String year;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Language {
        private String name;
        private Integer progress;
    }
}
