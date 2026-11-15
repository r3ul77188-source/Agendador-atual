# Agendador de Tarefas e Agendamentos (Agendador API)

## 📌 Descrição do Problema

O sistema **Agendador API** foi desenvolvido para solucionar a gestão e o controle de agendamentos de serviços técnicos (como manutenções e instalações de ar-condicionado). A aplicação automatiza o vínculo entre **clientes** solicitantes, **trabalhadores** (técnicos) responsáveis e **tarefas** disponíveis, evitando conflitos de horários através de restrições de unicidade e regras de negócio robustas.

---

## 🛠️ Tecnologias Utilizadas

* **Java 21** e **Spring Boot 3.3.5** (Spring Data JPA / Hibernate)
* **PostgreSQL** (banco de dados relacional)
* **Flyway** (migrações e versionamento do banco)
* **Docker e Docker Compose** (containerização e orquestração do ambiente)
* **JUnit 5, MockMvc e H2** (testes automatizados de integração/controllers)
* **Springdoc OpenAPI (Swagger)** (documentação interativa da API)
* **Render** (deploy em nuvem)

---

## ☁️ Deploy

A API está publicada no Render:

* **URL base:** https://agendadortarefas.onrender.com
* **Swagger UI:** https://agendadortarefas.onrender.com/swagger-ui/index.html

> No plano gratuito do Render, a aplicação "dorme" após alguns minutos sem uso. A primeira requisição pode levar cerca de 50 segundos para responder.

---

## 🚀 Como Executar o Projeto

### Pré-requisitos

* Docker e Docker Compose instalados (recomendado)
* Java 21 e Maven instalados (apenas se for rodar sem Docker)

### Opção 1: Docker Compose (recomendado)

Na raiz do projeto (onde está o `docker-compose.yml`):

```bash
docker compose up --build -d
```

A aplicação sobe junto com o PostgreSQL e fica acessível em `http://localhost:8080`.

Para parar o ambiente:

```bash
docker compose down
```

### Opção 2: Maven (local)

Tenha um PostgreSQL rodando (o `docker-compose` expõe a porta `5433` no host) e crie um `.env` na raiz a partir do modelo:

```bash
cp .env.example .env
```

O `application.yml` importa esse arquivo automaticamente. Se preferir variáveis de ambiente:

```bash
DB_URL=jdbc:postgresql://localhost:5433/agendador \
DB_USER=agendador \
DB_PASSWORD=agendador \
mvn spring-boot:run
```

> Sem configuração, a aplicação assume `jdbc:postgresql://localhost:5433/agendador` com usuário/senha `agendador`.

Subir apenas o banco com Docker e rodar a API pelo Maven:

```bash
docker compose up -d postgres
mvn spring-boot:run
```

---

## 🧪 Como Executar os Testes

A suíte cobre cadastro válido, cadastro inválido e consultas. Os testes sobem um banco **H2 em memória** (modo PostgreSQL), aplicam as migrations do Flyway e não precisam do Docker rodando:

```bash
mvn test
```

---

## 🌐 Endpoints Disponíveis

Documentação interativa (Swagger UI):

* Local: http://localhost:8080/swagger-ui/index.html
* Produção: https://agendadortarefas.onrender.com/swagger-ui/index.html

| Recurso       | Método | Rota                | Descrição                          |
|---------------|--------|---------------------|------------------------------------|
| Clientes      | GET    | `/client`           | Lista todos os clientes            |
|               | GET    | `/client/{id}`      | Busca cliente por ID               |
|               | POST   | `/client`           | Cadastra um novo cliente           |
|               | PUT    | `/client/{id}`      | Atualiza um cliente                |
|               | DELETE | `/client/{id}`      | Remove um cliente                  |
| Trabalhadores | GET    | `/worker`           | Lista todos os trabalhadores       |
|               | GET    | `/worker/{id}`      | Busca trabalhador por ID           |
|               | POST   | `/worker`           | Cadastra um novo trabalhador       |
|               | PUT    | `/worker/{id}`      | Atualiza um trabalhador            |
|               | DELETE | `/worker/{id}`      | Remove um trabalhador              |
| Tarefas       | GET    | `/task`             | Lista todas as tarefas disponíveis |
|               | GET    | `/task/{id}`        | Busca tarefa por ID                |
|               | POST   | `/task`             | Cadastra uma nova tarefa           |
|               | PUT    | `/task/{id}`        | Atualiza uma tarefa                |
|               | DELETE | `/task/{id}`        | Remove uma tarefa                  |
| Agendamentos  | GET    | `/appointment`      | Lista todos os agendamentos        |
|               | GET    | `/appointment/{id}` | Busca agendamento por ID           |
|               | POST   | `/appointment`      | Cria um novo agendamento           |
|               | PUT    | `/appointment/{id}` | Atualiza um agendamento            |
|               | DELETE | `/appointment/{id}` | Remove um agendamento              |

> As operações `POST`/`PUT` recebem DTOs de request (`ClientRequest`, `WorkerRequest`, `TaskRequest`, `AppointmentRequest`) com Bean Validation. Exclusões retornam `204 No Content`; quando há agendamentos vinculados a exclusão é bloqueada com `409 Conflict`.

### Formato de data do agendamento

O campo `moment` usa o pattern `HH:mm dd/MM/yyyy` (ex.: `10:00 01/12/2026`). O campo `status` do request é **numérico**: `1` (PENDING), `2` (PROCESS), `3` (COMPLETED). Na resposta, `status` vem como texto (`"PENDING"`, `"PROCESS"`, `"COMPLETED"`).

### CORS

A API libera o front por padrão em `http://localhost:5173` e `http://localhost:4173` (`CorsConfig`). Para publicar o front em outro domínio, defina a variável de ambiente:

```bash
CORS_ALLOWED_ORIGINS=https://seu-front.vercel.app,https://outro-dominio.com
```

### Formato dos erros

Todos os erros seguem o mesmo corpo JSON, facilitando o tratamento no front-end:

```json
{
  "timestamp": "2026-11-14T20:23:46Z",
  "status": 409,
  "error": "Operation not allowed",
  "message": "Client has appointments and cannot be removed. Delete the appointments first.",
  "path": "/client/1"
}
```

| Status | Quando acontece |
|--------|-----------------|
| `400 Bad Request` | Validação de campos, JSON malformado ou data fora do pattern |
| `404 Not Found` | Recurso ou rota inexistente |
| `405 Method Not Allowed` | Método HTTP não suportado pela rota |
| `409 Conflict` | Horário já ocupado, campo único duplicado ou exclusão com vínculos |


---

## 📥 Exemplos de Requisições

### 1. Cadastrar um cliente (`POST /client`)

```bash
curl -X POST http://localhost:8080/client \
  -H "Content-Type: application/json" \
  -d '{"name": "Tiago", "surname": "Henrique", "cellphone": "11912345678", "address": "Rua das Acácias, 120"}'
```

### 2. Cadastrar um agendamento (`POST /appointment`)

**Request body:**

```json
{
    "description": "Limpeza simples de Ar condicionado",
    "moment": "10:00 01/12/2026",
    "status": 1,
    "taskId": 1,
    "clientId": 1,
    "workerId": 1
}
```

**Resposta esperada (201 Created):**

```json
{
    "id": 1,
    "description": "Limpeza simples de Ar condicionado",
    "moment": "10:00 01/12/2026",
    "status": "PENDING",
    "task": { "id": 1, "description": "Limpeza simples de Ar condicionado" },
    "client": { "id": 1, "name": "Tiago", "surname": "Henrique", "cellphone": "11912345678", "address": "Rua das Acácias, 120" },
    "worker": { "id": 1, "name": "Joao", "surname": "Carlos" }
}
```

### 3. Agendamento com conflito de horário

Enviar novamente o mesmo `workerId` e `moment` retorna `409 Conflict` com a mensagem `Appointment already exists for this worker at this time.` O front-end exibe esse retorno de forma amigável no formulário.

### 4. Buscar agendamento por ID (`GET /appointment/1`)

```bash
curl http://localhost:8080/appointment/1
```

### 5. Listar agendamentos em produção

```bash
curl https://agendadortarefas.onrender.com/appointment
```

---

## 🖥️ Front-end (React + Vite)

A pasta [`frontend`](./frontend) contém a interface completa (dashboard, CRUDs, tema claro/escuro, responsivo).

### Rodar os dois juntos

**1. Backend** (na raiz):

```bash
docker compose up --build -d
```

A API fica em `http://localhost:8080`.

**2. Frontend** (em outro terminal):

```bash
cd frontend
npm install
npm run dev
```

Acesse `http://localhost:5173`.

### Configuração

- URL da API: `frontend/.env` → `VITE_API_URL=http://localhost:8080`
- CORS: já configurado para `localhost:5173`/`localhost:4173`; em produção use `CORS_ALLOWED_ORIGINS`.
- Autenticação: a API não possui autenticação, portanto não há login. O cliente HTTP já injeta `Authorization: Bearer` caso um token seja salvo em `pauta.token` no futuro.

Mais detalhes em [`frontend/README.md`](./frontend/README.md).

---

## 👥 Integrantes da Equipe

* Herbert
* Raul
* Leydson Renan
* Pedro Joao
* Lucas Gabriel
