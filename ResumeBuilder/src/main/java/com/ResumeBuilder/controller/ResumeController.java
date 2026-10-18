package com.ResumeBuilder.controller;

import com.ResumeBuilder.documents.Resume;
import com.ResumeBuilder.dto.request.CreateResumeRequest;
import com.ResumeBuilder.service.ResumeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/resumes")
public class ResumeController {

    private final ResumeService resumeService;

    @PostMapping
    public ResponseEntity<Resume> create(@Valid @RequestBody CreateResumeRequest request,
                                         @AuthenticationPrincipal String userId) {
        return ResponseEntity.status(HttpStatus.CREATED).body(resumeService.create(request, userId));
    }

    @GetMapping
    public ResponseEntity<List<Resume>> list(@AuthenticationPrincipal String userId) {
        return ResponseEntity.ok(resumeService.getUserResumes(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Resume> get(@PathVariable String id, @AuthenticationPrincipal String userId) {
        return ResponseEntity.ok(resumeService.getById(id, userId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Resume> update(@PathVariable String id, @RequestBody Resume resume,
                                         @AuthenticationPrincipal String userId) {
        return ResponseEntity.ok(resumeService.update(id, resume, userId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id, @AuthenticationPrincipal String userId) {
        resumeService.delete(id, userId);
        return ResponseEntity.noContent().build();
    }
}
