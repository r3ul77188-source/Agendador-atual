# Pauta · Front-end

Interface de gestão de agendamentos para a API Spring Boot do repositório raiz.

**Stack:** React 19 · Vite 8 · TypeScript · Tailwind CSS 4 · TanStack Query · React Hook Form + Zod · Axios · React Router · Lucide.

## Como rodar

### 1. Suba a API

Na raiz do repositório:

```bash
docker compose up --build -d
```

A API sobe em `http://localhost:8080` (Swagger em `/swagger-ui/index.html`).

### 2. Suba o front

```bash
cd frontend
npm install
npm run dev
```

Abra `http://localhost:5173`.

> A API precisa liberar a origem do front (CORS). O `CorsConfig` já permite `localhost:5173` e `localhost:4173`. Para outro domínio, use `CORS_ALLOWED_ORIGINS=https://seu-front.com` no ambiente do backend.

### Variáveis de ambiente

| Arquivo | Variável | Descrição |
|---|---|---|
| `frontend/.env` | `VITE_API_URL` | URL base da API. Padrão: `http://localhost:8080`. Em produção: `https://agendadortarefas.onrender.com`. |

## Scripts

```bash
npm run dev        # servidor de desenvolvimento
npm run build      # type-check + build de produção em dist/
npm run preview    # serve o build de produção
npm run typecheck  # somente TypeScript
```

## Estrutura

```
frontend/
├─ src/
│  ├─ components/
│  │  ├─ appointments/     # formulário e detalhes de agendamento
│  │  ├─ clients/          # formulário de cliente
│  │  ├─ dashboard/        # cards, próximo atendimento, status, próximos 7 dias
│  │  ├─ layout/           # AppShell (sidebar + topbar) e PageHeader
│  │  ├─ tasks/            # formulário de serviço
│  │  ├─ ui/               # design system (Button, Input, Modal, Toast, …)
│  │  └─ workers/          # formulário de técnico
│  ├─ context/             # ThemeProvider (claro/escuro)
│  ├─ hooks/               # queries/mutations por recurso + controles de lista
│  ├─ lib/                 # http, erros, formatos, schemas Zod, toasts, utils
│  ├─ pages/               # Dashboard, Agendamentos, Clientes, Técnicos, Serviços
│  ├─ services/            # camada de serviço centralizada (axios)
│  └─ types/               # tipos gerados a partir dos DTOs Java
├─ public/
├─ .env
└─ vite.config.ts
```

## Camada de dados

- `src/lib/http.ts` — instância Axios única com `baseURL` vinda do `.env`, timeout de 50s (cold start do Render), injeção de token (`pauta.token`) pronta para uma futura autenticação JWT e normalização de erros em `ApiError`.
- `src/services/api.ts` — endpoints de clientes, técnicos, serviços e agendamentos.
- `src/lib/queryClient.ts` — cache do TanStack Query, retry apenas para rede/5xx e toast global para erros de mutação.
- `src/hooks/*` — hooks de leitura e escrita com invalidação de cache e toasts de sucesso.

## Validação espelhando o backend

`src/lib/schemas.ts` reproduz as regras do Java:

| Campo | Regra |
|---|---|
| Cliente/ técnico `name`, `surname` | obrigatório, máx. 50 |
| Cliente `cellphone` | 10–11 dígitos numéricos |
| Cliente `address` | obrigatório, máx. 200 |
| Serviço `description` | obrigatório, máx. 150 |
| Agendamento `description` | obrigatório, máx. 150 |
| Agendamento `moment` | data/hora futura (na criação), formato `HH:mm dd/MM/yyyy` |
| Agendamento `status` | 1, 2 ou 3 (enviado como número) |
| Agendamento `taskId`/`clientId`/`workerId` | obrigatórios e positivos |

Erros de campo retornados pela API (`fieldErrors`) são aplicados diretamente no formulário. Conflitos de horário (`409`) e bloqueios de exclusão são traduzidos em mensagens amigáveis.

## Design

- **Identidade:** “Pauta”, tipografia Sora (títulos), Inter (texto) e JetBrains Mono (horários/números).
- **Paleta:** grafite profundo + âmbar como cor de destaque; modo claro em papel quente.
- **Layout:** sidebar fixa no desktop, off-canvas no mobile; dashboard com cards, próximo atendimento, distribuição por status e próximos 7 dias.
- **Interações:** hover/transições discretas, modais animados, toasts com progresso, skeletons, estados vazios e de erro.
- **Acessibilidade:** foco visível, labels associados, `aria-invalid`/`aria-live`, trap de foco e fechamento por Esc nos modais, skip link e respeito a `prefers-reduced-motion`.

## Observações sobre a API

- A API não possui autenticação; por isso não há tela de login. O interceptor de token já está preparado para quando houver JWT.
- Listagem, busca, filtros, ordenação e paginação são feitos no cliente, pois os endpoints retornam a coleção completa.
- `DELETE` pode retornar `409 Conflict` quando o registro possui agendamentos vinculados; o front exibe a mensagem e mantém o registro.
