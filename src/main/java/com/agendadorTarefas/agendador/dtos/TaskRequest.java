package com.agendadorTarefas.agendador.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record TaskRequest(
        @NotBlank(message = "Description is required")
        @Size(max = 150, message = "Description must have at most 150 characters")
        String description
) {
}
