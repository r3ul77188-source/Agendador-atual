package com.agendadorTarefas.agendador.controllers;

import com.agendadorTarefas.agendador.dtos.WorkerRequest;
import com.agendadorTarefas.agendador.dtos.WorkerSummary;
import com.agendadorTarefas.agendador.services.WorkerService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/worker")
public class WorkerController {

    private final WorkerService workerService;

    public WorkerController(WorkerService workerService) {
        this.workerService = workerService;
    }

    @GetMapping("/{id}")
    public ResponseEntity<WorkerSummary> findById(@PathVariable Long id) {
        return ResponseEntity.ok(workerService.findById(id));
    }

    @GetMapping
    public ResponseEntity<List<WorkerSummary>> findAll() {
        return ResponseEntity.ok(workerService.findAll());
    }

    @PostMapping
    public ResponseEntity<WorkerSummary> insert(@Valid @RequestBody WorkerRequest request) {
        WorkerSummary worker = workerService.create(request);

        URI uri = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}")
                .buildAndExpand(worker.id()).toUri();

        return ResponseEntity.created(uri).body(worker);
    }

    @PutMapping("/{id}")
    public ResponseEntity<WorkerSummary> update(@PathVariable Long id, @Valid @RequestBody WorkerRequest request) {
        return ResponseEntity.ok(workerService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        workerService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
