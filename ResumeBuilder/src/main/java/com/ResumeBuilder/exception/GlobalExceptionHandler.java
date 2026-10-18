package com.ResumeBuilder.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationException(MethodArgumentNotValidException ex) {
        Map<String,String> errors=new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error)->{
            String fieldName=((FieldError)error).getField();
            String errorMessage=error.getDefaultMessage();
            errors.put(fieldName,errorMessage);
        });

        Map<String,Object> response=new HashMap<>();
        response.put("message","Validation Failed");
        response.put("errors",errors);

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }
    @ExceptionHandler(ResourceExistsException.class)
    public ResponseEntity<Map<String,Object>> handleResourceExistsException(ResourceExistsException ex) {
        return build(HttpStatus.CONFLICT, ex.getMessage());
    }
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<Map<String,Object>> handleResourceNotFoundException(ResourceNotFoundException ex) {
        return build(HttpStatus.NOT_FOUND, ex.getMessage());
    }
    @ExceptionHandler(InvalidCredentialsException.class)
    public ResponseEntity<Map<String,Object>> handleInvalidCredentialsException(InvalidCredentialsException ex) {
        return build(HttpStatus.UNAUTHORIZED, ex.getMessage());
    }
    @ExceptionHandler(EmailNotVerifiedException.class)
    public ResponseEntity<Map<String,Object>> handleEmailNotVerifiedException(EmailNotVerifiedException ex) {
        return build(HttpStatus.FORBIDDEN, ex.getMessage());
    }
    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<Map<String,Object>> handleBadRequestException(BadRequestException ex) {
        return build(HttpStatus.BAD_REQUEST, ex.getMessage());
    }
    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<Map<String,Object>> handleMaxUploadSizeExceededException(MaxUploadSizeExceededException ex) {
        return build(HttpStatus.PAYLOAD_TOO_LARGE, "File is too large. Maximum size is 5MB.");
    }
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String,Object>> handleGenericException(Exception ex) {
        log.error("Unexpected error", ex);
        Map<String,Object> response=new HashMap<>();
        response.put("message","Someting went wrong. Contact administrator.");
        response.put("errors",ex.getMessage());

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);

    }

    private ResponseEntity<Map<String,Object>> build(HttpStatus status, String message) {
        Map<String,Object> response=new HashMap<>();
        response.put("message",message);
        return ResponseEntity.status(status).body(response);
    }
}
