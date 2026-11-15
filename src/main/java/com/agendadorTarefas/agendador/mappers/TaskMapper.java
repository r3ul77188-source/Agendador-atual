package com.agendadorTarefas.agendador.mappers;

import com.agendadorTarefas.agendador.dtos.TaskRequest;
import com.agendadorTarefas.agendador.dtos.TaskSummary;
import com.agendadorTarefas.agendador.entities.Task;
import org.springframework.stereotype.Component;

@Component
public class TaskMapper {

    public Task toEntity(TaskSummary taskSummary) {
        return toEntity(taskSummary.description());
    }

    public Task toEntity(TaskRequest request) {
        return toEntity(request.description());
    }

    private Task toEntity(String description) {
        Task task = new Task();
        task.setId(null);
        task.setDescription(description);
        return task;
    }

    public TaskSummary toDto(Task task) {
        return new TaskSummary(task.getId(), task.getDescription());
    }
}
