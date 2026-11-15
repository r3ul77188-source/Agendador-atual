package com.agendadorTarefas.agendador.services.validation;

import com.agendadorTarefas.agendador.entities.Appointment;
import com.agendadorTarefas.agendador.entities.enums.Status;
import com.agendadorTarefas.agendador.exception.DuplicateDateException;
import com.agendadorTarefas.agendador.exception.InvalidDateException;
import com.agendadorTarefas.agendador.repositories.AppointmentRepository;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class DefaultAppointmentValidator implements AppointmentValidator {

    private final AppointmentRepository appointmentRepository;

    public DefaultAppointmentValidator(AppointmentRepository appointmentRepository) {
        this.appointmentRepository = appointmentRepository;
    }

    @Override
    public void validate(Appointment appointment) {
        validateComponents(appointment);
        validateDate(appointment.getMoment(), appointment.getStatus());
        checkWorkerAppointment(appointment.getWorker().getId(), appointment.getMoment());
    }

    @Override
    public void validateForUpdate(Appointment appointment, LocalDateTime previousMoment) {
        validateComponents(appointment);
        // Só exige data futura quando o horário realmente mudou.
        if (!appointment.getMoment().equals(previousMoment)) {
            validateDate(appointment.getMoment(), appointment.getStatus());
        }
        if (appointmentRepository.existsByWorkerIdAndMomentAndIdNot(
                appointment.getWorker().getId(), appointment.getMoment(), appointment.getId())) {
            throw new DuplicateDateException("Appointment already exists for this worker at this time.");
        }
    }

    private void validateComponents(Appointment appointment) {
        if (appointment.getClient() == null || appointment.getClient().getId() == null) {
            throw new IllegalArgumentException("Client is required");
        } else if (appointment.getWorker() == null || appointment.getWorker().getId() == null) {
            throw new IllegalArgumentException("Worker is required");
        } else if (appointment.getTask() == null || appointment.getTask().getId() == null) {
            throw new IllegalArgumentException("Task is required");
        }
    }

    private void validateDate(LocalDateTime moment, Status status) {
        if (moment == null) {
            throw new InvalidDateException("Date cannot be null");
        } else if (moment.isBefore(LocalDateTime.now())) {
            throw new InvalidDateException("Date must be in the future");
        }
    }

    private void checkWorkerAppointment(Long workerId, LocalDateTime moment) {
        if (appointmentRepository.existsByWorkerIdAndMoment(workerId, moment)) {
            throw new DuplicateDateException("Appointment already exists for this worker at this time.");
        }
    }
}
