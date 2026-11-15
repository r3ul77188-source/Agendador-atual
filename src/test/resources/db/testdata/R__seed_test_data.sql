-- Massa mínima para os testes de integração (IDs fixos usados pelo AppointmentControllerTest).
INSERT INTO tb_client (name, surname, cell_phone, address)
VALUES ('Cliente', 'De Teste', '11999990000', 'Rua dos Testes, 1');

INSERT INTO tb_task (description)
VALUES ('Serviço de teste');

INSERT INTO tb_worker (name, surname)
VALUES ('Técnico', 'De Teste');
