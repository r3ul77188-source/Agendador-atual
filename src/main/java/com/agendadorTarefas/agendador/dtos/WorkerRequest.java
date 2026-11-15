package com.agendadorTarefas.agendador.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record WorkerRequest(
        @NotBlank(message = "Name is required")
        @Size(max = 50, message = "Name must have at most 50 characters")
        String name,

        @NotBlank(message = "Surname is required")
        @Size(max = 50, message = "Surname must have at most 50 characters")
        String surname
) {
}
