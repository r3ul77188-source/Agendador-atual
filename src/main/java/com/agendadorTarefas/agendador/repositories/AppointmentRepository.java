package com.agendadorTarefas.agendador.repositories;

import com.agendadorTarefas.agendador.entities.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    boolean existsByWorkerIdAndMoment(Long workerId, LocalDateTime moment);

    boolean existsByWorkerIdAndMomentAndIdNot(Long workerId, LocalDateTime moment, Long id);
}
