package com.agendadorTarefas.agendador.services;

import com.agendadorTarefas.agendador.dtos.TaskRequest;
import com.agendadorTarefas.agendador.dtos.TaskSummary;
import com.agendadorTarefas.agendador.entities.Task;
import com.agendadorTarefas.agendador.exception.NotFoundTaskException;
import com.agendadorTarefas.agendador.mappers.TaskMapper;
import com.agendadorTarefas.agendador.repositories.TaskRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class TaskService {

    private final TaskRepository taskRepository;
    private final TaskMapper taskMapper;

    public TaskService(TaskRepository taskRepository, TaskMapper taskMapper) {
        this.taskRepository = taskRepository;
        this.taskMapper = taskMapper;
    }

    @Transactional(readOnly = true)
    public TaskSummary findById(Long id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new NotFoundTaskException("Not Found Task id: " + id));
        return taskMapper.toDto(task);
    }

    @Transactional(readOnly = true)
    public List<TaskSummary> findAll() {
        return taskRepository.findAll().stream()
                .map(taskMapper::toDto).toList();
    }

    @Transactional
    public TaskSummary create(TaskRequest request) {
        Task task = taskMapper.toEntity(request);
        taskRepository.save(task);
        return taskMapper.toDto(task);
    }

    @Transactional
    public TaskSummary update(Long id, TaskRequest request) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new NotFoundTaskException("Not Found Task id: " + id));

        task.setDescription(request.description());
        taskRepository.save(task);
        return taskMapper.toDto(task);
    }

    @Transactional
    public void delete(Long id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new NotFoundTaskException("Not Found Task id: " + id));

        if (!task.getAppointments().isEmpty()) {
            throw new IllegalStateException(
                    "Task has appointments and cannot be removed. Delete the appointments first.");
        }
        taskRepository.delete(task);
    }
}
