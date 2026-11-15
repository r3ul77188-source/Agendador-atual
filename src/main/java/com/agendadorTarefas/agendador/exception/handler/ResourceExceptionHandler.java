package com.agendadorTarefas.agendador.exception.handler;

import com.agendadorTarefas.agendador.exception.*;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.time.Instant;
import java.util.List;

@RestControllerAdvice
public class ResourceExceptionHandler {

    @ExceptionHandler(NotFoundWorkerException.class)
    public ResponseEntity<StandError> notFoundWorkerException(NotFoundWorkerException e, HttpServletRequest request) {
        return build(HttpStatus.NOT_FOUND, "Worker not found", e.getMessage(), request);
    }

    @ExceptionHandler(NotFoundTaskException.class)
    public ResponseEntity<StandError> notFoundTaskException(NotFoundTaskException e, HttpServletRequest request) {
        return build(HttpStatus.NOT_FOUND, "Task not found", e.getMessage(), request);
    }

    @ExceptionHandler(NotFoundAppointmentException.class)
    public ResponseEntity<StandError> notFoundAppointmentException(NotFoundAppointmentException e, HttpServletRequest request) {
        return build(HttpStatus.NOT_FOUND, "Appointment not found", e.getMessage(), request);
    }

    @ExceptionHandler(NotFoundClientException.class)
    public ResponseEntity<StandError> notFoundClientException(NotFoundClientException e, HttpServletRequest request) {
        return build(HttpStatus.NOT_FOUND, "Client not found", e.getMessage(), request);
    }

    @ExceptionHandler(DuplicateDateException.class)
    public ResponseEntity<StandError> duplicateDateException(DuplicateDateException e, HttpServletRequest request) {
        return build(HttpStatus.CONFLICT, "Duplicate date", e.getMessage(), request);
    }

    @ExceptionHandler(InvalidDateException.class)
    public ResponseEntity<StandError> invalidDateException(InvalidDateException e, HttpServletRequest request) {
        return build(HttpStatus.BAD_REQUEST, "Date invalid", e.getMessage(), request);
    }

    /** Erros de @Valid: retorna a lista de campos inválidos. */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ValidationError> validationException(MethodArgumentNotValidException e,
                                                                HttpServletRequest request) {
        List<FieldMessage> fieldErrors = e.getBindingResult().getFieldErrors().stream()
                .map(error -> new FieldMessage(error.getField(), error.getDefaultMessage()))
                .toList();

        ValidationError body = new ValidationError(
                Instant.now(),
                HttpStatus.BAD_REQUEST.value(),
                "Validation failed",
                "One or more fields are invalid",
                request.getRequestURI(),
                fieldErrors
        );

        return ResponseEntity.badRequest().body(body);
    }

    /** JSON malformado ou data fora do padrão "HH:mm dd/MM/yyyy". */
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<StandError> unreadableBody(HttpMessageNotReadableException e, HttpServletRequest request) {
        return build(HttpStatus.BAD_REQUEST, "Malformed request",
                "Request body is invalid. Dates must follow the pattern 'HH:mm dd/MM/yyyy'.", request);
    }

    /** Violação de unique constraint (telefone/endereço/descrição duplicados). */
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<StandError> dataIntegrity(DataIntegrityViolationException e, HttpServletRequest request) {
        return build(HttpStatus.CONFLICT, "Data conflict",
                "This record conflicts with data that already exists (unique field).", request);
    }

    @ExceptionHandler({IllegalArgumentException.class})
    public ResponseEntity<StandError> illegalArgument(IllegalArgumentException e, HttpServletRequest request) {
        return build(HttpStatus.BAD_REQUEST, "Invalid request", e.getMessage(), request);
    }

    /** Regras de integridade ao excluir (ex.: cliente com agendamentos). */
    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<StandError> illegalState(IllegalStateException e, HttpServletRequest request) {
        return build(HttpStatus.CONFLICT, "Operation not allowed", e.getMessage(), request);
    }

    /** Rota inexistente: responde 404 em vez de cair no handler genérico de 500. */
    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<StandError> noResource(NoResourceFoundException e, HttpServletRequest request) {
        return build(HttpStatus.NOT_FOUND, "Not found",
                "No endpoint found for this path.", request);
    }

    /** Método HTTP não suportado pelo endpoint (ex.: PATCH). */
    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<StandError> methodNotSupported(HttpRequestMethodNotSupportedException e,
                                                         HttpServletRequest request) {
        return build(HttpStatus.METHOD_NOT_ALLOWED, "Method not allowed", e.getMessage(), request);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<StandError> unexpected(Exception e, HttpServletRequest request) {
        return build(HttpStatus.INTERNAL_SERVER_ERROR, "Internal server error",
                "An unexpected error occurred.", request);
    }

    private ResponseEntity<StandError> build(HttpStatus status, String error, String message,
                                             HttpServletRequest request) {
        StandError body = new StandError(Instant.now(), status.value(), error, message, request.getRequestURI());
        return ResponseEntity.status(status).body(body);
    }
}
