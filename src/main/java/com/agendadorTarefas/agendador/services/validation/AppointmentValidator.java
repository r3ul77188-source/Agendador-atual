package com.agendadorTarefas.agendador.services.validation;

import com.agendadorTarefas.agendador.entities.Appointment;

import java.time.LocalDateTime;

public interface AppointmentValidator {

    void validate(Appointment appointment);

    /**
     * Valida uma edição. O horário anterior é usado para permitir salvar um
     * agendamento antigo sem alterar a data (evita bloquear edições de descrição).
     */
    void validateForUpdate(Appointment appointment, LocalDateTime previousMoment);
}
