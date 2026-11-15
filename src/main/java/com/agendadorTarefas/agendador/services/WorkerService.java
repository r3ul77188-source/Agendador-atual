package com.agendadorTarefas.agendador.services;

import com.agendadorTarefas.agendador.dtos.WorkerRequest;
import com.agendadorTarefas.agendador.dtos.WorkerSummary;
import com.agendadorTarefas.agendador.entities.Worker;
import com.agendadorTarefas.agendador.exception.NotFoundWorkerException;
import com.agendadorTarefas.agendador.mappers.WorkerMapper;
import com.agendadorTarefas.agendador.repositories.WorkerRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class WorkerService {

    private final WorkerRepository workerRepository;
    private final WorkerMapper workerMapper;

    public WorkerService(WorkerRepository workerRepository, WorkerMapper workerMapper) {
        this.workerRepository = workerRepository;
        this.workerMapper = workerMapper;
    }

    @Transactional(readOnly = true)
    public WorkerSummary findById(Long id) {
        Worker worker = workerRepository.findById(id)
                .orElseThrow(() -> new NotFoundWorkerException("Not Found Worker id: " + id));
        return workerMapper.toDto(worker);
    }

    @Transactional(readOnly = true)
    public List<WorkerSummary> findAll() {
        return workerRepository.findAll().stream()
                .map(workerMapper::toDto).toList();
    }

    @Transactional
    public WorkerSummary create(WorkerRequest request) {
        Worker worker = workerMapper.toEntity(request);
        workerRepository.save(worker);
        return workerMapper.toDto(worker);
    }

    @Transactional
    public WorkerSummary update(Long id, WorkerRequest request) {
        Worker worker = workerRepository.findById(id)
                .orElseThrow(() -> new NotFoundWorkerException("Not Found Worker id: " + id));

        worker.setName(request.name());
        worker.setSurname(request.surname());
        workerRepository.save(worker);
        return workerMapper.toDto(worker);
    }

    @Transactional
    public void delete(Long id) {
        Worker worker = workerRepository.findById(id)
                .orElseThrow(() -> new NotFoundWorkerException("Not Found Worker id: " + id));

        if (!worker.getAppointments().isEmpty()) {
            throw new IllegalStateException(
                    "Worker has appointments and cannot be removed. Delete the appointments first.");
        }
        workerRepository.delete(worker);
    }
}
