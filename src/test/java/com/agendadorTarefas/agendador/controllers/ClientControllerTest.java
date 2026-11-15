package com.agendadorTarefas.agendador.controllers;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class ClientControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private String clientJson(String name, String surname, String cellphone) {
        return """
            {
                "name": "%s",
                "surname": "%s",
                "cellphone": "%s",
                "address": "Rua dos Testes, 100"
            }
            """.formatted(name, surname, cellphone);
    }

    private long createClient(String cellphone) throws Exception {
        MvcResult result = mockMvc.perform(post("/client")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(clientJson("Cliente", "CRUD", cellphone)))
                .andExpect(status().isCreated())
                .andReturn();

        JsonNode body = objectMapper.readTree(result.getResponse().getContentAsString());
        return body.get("id").asLong();
    }

    @Test
    @DisplayName("POST /client - cria um cliente")
    void shouldCreateClient() throws Exception {
        mockMvc.perform(post("/client")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(clientJson("Ana", "Criada", "11988887777")))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.name").value("Ana"));
    }

    @Test
    @DisplayName("PUT /client/{id} - atualiza um cliente existente")
    void shouldUpdateClient() throws Exception {
        long id = createClient("11988886666");

        mockMvc.perform(put("/client/{id}", id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(clientJson("Ana", "Atualizada", "11988886666")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(id))
                .andExpect(jsonPath("$.surname").value("Atualizada"));
    }

    @Test
    @DisplayName("DELETE /client/{id} - remove um cliente sem agendamentos")
    void shouldDeleteClient() throws Exception {
        long id = createClient("11988885555");

        mockMvc.perform(delete("/client/{id}", id))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/client/{id}", id))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("PUT /client/{id} - retorna 404 quando o cliente não existe")
    void shouldReturnNotFoundWhenClientDoesNotExist() throws Exception {
        mockMvc.perform(put("/client/{id}", 999_999)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(clientJson("Fantasma", "Inexistente", "11988884444")))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("POST /client - retorna 400 com erros de campo")
    void shouldValidateClientPayload() throws Exception {
        mockMvc.perform(post("/client")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                            {"name": "", "surname": "", "cellphone": "123", "address": ""}
                            """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors").isArray())
                .andExpect(jsonPath("$.fieldErrors[?(@.field == 'cellphone')]").exists());
    }
}
