package com.ResumeBuilder.service;

import com.ResumeBuilder.documents.Resume;
import com.ResumeBuilder.dto.request.CreateResumeRequest;
import com.ResumeBuilder.exception.BadRequestException;
import com.ResumeBuilder.exception.ResourceNotFoundException;
import com.ResumeBuilder.repository.interfaces.ResumeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class ResumeService {

    private final ResumeRepository resumeRepository;

    public Resume create(CreateResumeRequest request, String userId) {
        Resume resume = Resume.builder()
                .userId(userId)
                .title(request.getTitle().trim())
                .build();
        return resumeRepository.save(resume);
    }

    public List<Resume> getUserResumes(String userId) {
        return resumeRepository.findByUserIdOrderByUpdatedAtDesc(userId);
    }

    public Resume getById(String id, String userId) {
        // Baska kullanicinin CV'si de "bulunamadi" doner; var olup olmadigi disari sizdirilmaz.
        return resumeRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Resume not found."));
    }

    public Resume update(String id, Resume changes, String userId) {
        Resume existing = getById(id, userId);

        if (changes.getTitle() == null || changes.getTitle().isBlank()) {
            throw new BadRequestException("Title is required!");
        }

        // id, userId ve createdAt istemciden gelse bile korunur.
        changes.setId(existing.getId());
        changes.setUserId(existing.getUserId());
        changes.setCreatedAt(existing.getCreatedAt());
        applyDefaults(changes);
        return resumeRepository.save(changes);
    }

    // Istek govdesinde gonderilmeyen bolumler null yerine bos deger olarak saklanir.
    private void applyDefaults(Resume r) {
        if (r.getTemplate() == null) r.setTemplate(new Resume.Template());
        if (r.getProfileInfo() == null) r.setProfileInfo(new Resume.ProfileInfo());
        if (r.getContactInfo() == null) r.setContactInfo(new Resume.ContactInfo());
        if (r.getWorkExperience() == null) r.setWorkExperience(new ArrayList<>());
        if (r.getEducation() == null) r.setEducation(new ArrayList<>());
        if (r.getSkills() == null) r.setSkills(new ArrayList<>());
        if (r.getProjects() == null) r.setProjects(new ArrayList<>());
        if (r.getCertifications() == null) r.setCertifications(new ArrayList<>());
        if (r.getLanguages() == null) r.setLanguages(new ArrayList<>());
        if (r.getInterests() == null) r.setInterests(new ArrayList<>());
    }

    public void delete(String id, String userId) {
        resumeRepository.delete(getById(id, userId));
    }
}
