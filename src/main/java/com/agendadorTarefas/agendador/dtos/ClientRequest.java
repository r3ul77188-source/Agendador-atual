package com.agendadorTarefas.agendador.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * Payload de criação/edição de cliente.
 * Espelha as colunas da entidade Client (name 50, surname 50, cellPhone 11, address 200).
 */
public record ClientRequest(
        @NotBlank(message = "Name is required")
        @Size(max = 50, message = "Name must have at most 50 characters")
        String name,

        @NotBlank(message = "Surname is required")
        @Size(max = 50, message = "Surname must have at most 50 characters")
        String surname,

        @NotBlank(message = "Cellphone is required")
        @Size(min = 10, max = 11, message = "Cellphone must have 10 or 11 digits")
        @Pattern(regexp = "\\d{10,11}", message = "Cellphone must contain only digits")
        String cellphone,

        @NotBlank(message = "Address is required")
        @Size(max = 200, message = "Address must have at most 200 characters")
        String address
) {
}
