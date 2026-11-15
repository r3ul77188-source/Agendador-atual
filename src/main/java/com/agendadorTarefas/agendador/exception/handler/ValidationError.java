package com.agendadorTarefas.agendador.exception.handler;

import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.Instant;
import java.util.List;

/**
 * Erro de validação de campos (Bean Validation).
 * Formato consumido pelo front para destacar os inputs inválidos.
 */
public record ValidationError(
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy/MM/dd'T'HH:mm:ss'Z'", timezone = "GMT")
        Instant timestamp,
        Integer status,
        String error,
        String message,
        String path,
        List<FieldMessage> fieldErrors
) {
}
