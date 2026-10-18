package com.ResumeBuilder.repository.interfaces;

import com.ResumeBuilder.documents.Resume;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface ResumeRepository extends MongoRepository<Resume, String> {

    List<Resume> findByUserIdOrderByUpdatedAtDesc(String userId);
    Optional<Resume> findByIdAndUserId(String id, String userId);

}
