package com.agendadorTarefas.agendador.mappers;

import com.agendadorTarefas.agendador.dtos.WorkerRequest;
import com.agendadorTarefas.agendador.dtos.WorkerSummary;
import com.agendadorTarefas.agendador.entities.Worker;
import org.springframework.stereotype.Component;

@Component
public class WorkerMapper {

    public Worker toEntity(WorkerSummary dto) {
        return toEntity(dto.name(), dto.surname());
    }

    public Worker toEntity(WorkerRequest dto) {
        return toEntity(dto.name(), dto.surname());
    }

    private Worker toEntity(String name, String surname) {
        Worker worker = new Worker();
        worker.setId(null);
        worker.setName(name);
        worker.setSurname(surname);
        return worker;
    }

    public WorkerSummary toDto(Worker worker) {
        return new WorkerSummary(worker.getId(), worker.getName(), worker.getSurname());
    }
}
