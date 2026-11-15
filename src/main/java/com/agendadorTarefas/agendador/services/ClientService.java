package com.agendadorTarefas.agendador.services;

import com.agendadorTarefas.agendador.dtos.ClientRequest;
import com.agendadorTarefas.agendador.dtos.ClientSummary;
import com.agendadorTarefas.agendador.entities.Client;
import com.agendadorTarefas.agendador.exception.NotFoundClientException;
import com.agendadorTarefas.agendador.mappers.ClientMapper;
import com.agendadorTarefas.agendador.repositories.ClientRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ClientService {

    private final ClientRepository clientRepository;
    private final ClientMapper clientMapper;

    public ClientService(ClientRepository clientRepository, ClientMapper clientMapper) {
        this.clientRepository = clientRepository;
        this.clientMapper = clientMapper;
    }

    @Transactional(readOnly = true)
    public ClientSummary findById(Long id) {
        Client client = clientRepository.findById(id)
                .orElseThrow(() -> new NotFoundClientException("Not Found Client id: " + id));
        return clientMapper.toDto(client);
    }

    @Transactional(readOnly = true)
    public List<ClientSummary> findAll() {
        return clientRepository.findAll().stream()
                .map(clientMapper::toDto).toList();
    }

    @Transactional
    public ClientSummary create(ClientRequest request) {
        Client client = clientMapper.toEntity(request);
        clientRepository.save(client);
        return clientMapper.toDto(client);
    }

    @Transactional
    public ClientSummary update(Long id, ClientRequest request) {
        Client client = clientRepository.findById(id)
                .orElseThrow(() -> new NotFoundClientException("Not Found Client id: " + id));

        client.setName(request.name());
        client.setSurname(request.surname());
        client.setCellPhone(request.cellphone());
        client.setAddress(request.address());

        clientRepository.save(client);
        return clientMapper.toDto(client);
    }

    @Transactional
    public void delete(Long id) {
        Client client = clientRepository.findById(id)
                .orElseThrow(() -> new NotFoundClientException("Not Found Client id: " + id));

        if (!client.getAppointments().isEmpty()) {
            throw new IllegalStateException(
                    "Client has appointments and cannot be removed. Delete the appointments first.");
        }
        clientRepository.delete(client);
    }
}
