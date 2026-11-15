package com.agendadorTarefas.agendador.mappers;

import com.agendadorTarefas.agendador.dtos.ClientRequest;
import com.agendadorTarefas.agendador.dtos.ClientSummary;
import com.agendadorTarefas.agendador.entities.Client;
import org.springframework.stereotype.Component;

@Component
public class ClientMapper {

    public Client toEntity(ClientSummary dto) {
        return toEntity(dto.name(), dto.surname(), dto.cellphone(), dto.address());
    }

    public Client toEntity(ClientRequest dto) {
        return toEntity(dto.name(), dto.surname(), dto.cellphone(), dto.address());
    }

    private Client toEntity(String name, String surname, String cellphone, String address) {
        Client client = new Client();
        client.setId(null);
        client.setName(name);
        client.setSurname(surname);
        client.setCellPhone(cellphone);
        client.setAddress(address);
        return client;
    }

    public ClientSummary toDto(Client entity) {
        // Ordem do record: id, name, surname, cellphone, address
        return new ClientSummary(
                entity.getId(),
                entity.getName(),
                entity.getSurname(),
                entity.getCellPhone(),
                entity.getAddress()
        );
    }
}
