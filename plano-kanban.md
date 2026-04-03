# Plano de Desenvolvimento — Sistema Interno de Gestão de Tarefas (Kanban)

> Documento elaborado com foco em MVP profissional, baixo custo e rapidez de desenvolvimento.  
> Inspirado em ferramentas como ClickUp e Trello, para equipe de até 4 usuários.

---

## Objetivo do sistema

Desenvolver uma aplicação web simples, intuitiva e eficiente para uso interno, com foco em organização de tarefas e fluxo de trabalho no estilo Kanban.

---

## Funcionalidades

### Aba 1 — Kanban Board
- Criação, edição e exclusão de colunas
- Criação, edição e exclusão de tarefas
- Adição de tags nas tarefas
- Drag and drop: mover tarefas entre colunas, reordenar tarefas dentro da coluna e reordenar colunas
- Persistência automática dos dados

### Aba 2 — Criação e Gestão de Tarefas

Layout dividido em 3 colunas:

**Coluna 1 — Formulário**
- Nome da tarefa
- Descrição
- Data máxima de entrega
- Checkbox: "Prioridade para hoje"

**Coluna 2 — Fila de tarefas**
- Lista de todas as tarefas criadas
- Ordenação por data ou por criação

**Coluna 3 — Prioridade do dia**
- Lista apenas as tarefas marcadas como prioridade

---

## 1. Arquitetura do sistema

**Monolito moderno com Next.js** — frontend, API e autenticação dentro do mesmo projeto, sem infraestrutura extra.

| Camada | Tecnologia |
|---|---|
| Frontend | Next.js 14 (App Router) |
| API | Next.js Route Handlers |
| Banco de dados | PostgreSQL via Neon (serverless) |
| ORM | Prisma |
| Autenticação | NextAuth.js v5 |
| Estrutura | Monolito (sem backend separado) |

---

## 2. Stack completa

| Categoria | Tecnologia | Motivo |
|---|---|---|
| Framework | Next.js 14 | Full-stack, deploy simples, ecossistema maduro |
| UI | Shadcn/ui + Tailwind CSS | Componentes profissionais sem overhead |
| Drag and Drop | @dnd-kit/core | Moderno, acessível, bem mantido |
| Estado (UI) | Zustand | Simples, sem boilerplate |
| Estado (dados) | TanStack Query | Cache, sync e optimistic updates |
| ORM | Prisma | Tipagem TypeScript, migrations automáticas |
| Banco de dados | PostgreSQL (Neon) | Confiável, gratuito, relacional |
| Autenticação | NextAuth.js Credentials | Simples para equipe pequena |

---

## 3. Modelagem de dados

```
User
  id            UUID       PK
  name          String
  email         String     UNIQUE
  passwordHash  String
  createdAt     DateTime

Column
  id            UUID       PK
  title         String
  order         Int
  createdAt     DateTime

Task
  id            UUID       PK
  title         String
  description   String?
  dueDate       DateTime?
  isPriorityToday Boolean  DEFAULT false
  columnId      UUID       FK → Column
  order         Int
  createdAt     DateTime

Tag
  id            UUID       PK
  name          String
  color         String

TaskTag (junção M:N)
  taskId        UUID       FK → Task
  tagId         UUID       FK → Tag
```

> Os campos `order` em `Column` e `Task` controlam a posição visual. A cada drag and drop, os valores são atualizados em batch com espaçamento (ex: 1000, 2000, 3000) para minimizar escritas no banco.

---

## 4. Autenticação

Para 4 usuários, a abordagem recomendada é:

- **NextAuth.js com Credentials Provider** (email + senha com hash bcrypt)
- Os 4 usuários são criados diretamente via **seed do Prisma** — sem tela de cadastro
- Sem dependência de serviço externo

Alternativa mais simples: **Magic Link por email** (NextAuth Email Provider) — sem senha, o usuário recebe um link de acesso.

---

## 5. Deploy e execução — Opção A (Recomendada)

### Vercel + Neon — custo zero, sem servidor

**Passo a passo:**

1. Criar conta gratuita em [vercel.com](https://vercel.com)
2. Criar banco de dados gratuito em [neon.tech](https://neon.tech)
3. Subir o código no GitHub
4. Conectar o repositório ao Vercel
5. Configurar a connection string do Neon como variável de ambiente
6. O Vercel gera automaticamente uma URL (ex: `meukanban.vercel.app`)
7. Compartilhar o link com os 4 usuários

**Atualizações:** a cada `git push`, o Vercel reimplanta automaticamente em menos de 1 minuto.

| Item | Detalhe |
|---|---|
| Custo | R$ 0/mês (plano free) |
| Manutenção | Zero — totalmente gerenciado |
| Acesso | Qualquer dispositivo, qualquer lugar |
| HTTPS | Automático |
| Ambiente de dev | `npm run dev` + connection string do Neon |

---

## 6. Performance e simplicidade

O sistema se mantém leve pelas seguintes decisões:

- **Zustand** no lugar de Redux — 1/10 do código para o mesmo resultado
- **Optimistic updates** com TanStack Query — a UI responde imediatamente ao drag and drop, sem esperar o servidor; em caso de erro, o estado é revertido automaticamente
- **Client Components** apenas onde necessário (Kanban precisa ser reativo)
- **Sem GraphQL** — REST simples com Route Handlers é suficiente para este escopo

**Evitar:**
- Redux, GraphQL, microsserviços, SSR agressivo em páginas interativas

---

## 7. Escalabilidade futura

Mudanças graduais conforme o sistema crescer:

| Necessidade | Solução |
|---|---|
| Mais usuários / times | Adicionar tabela `Team` e campo `teamId` nas colunas e tarefas |
| Colaboração em tempo real | Substituir polling por WebSockets com Pusher ou Ably |
| Performance no banco | Adicionar índices nos campos `columnId` e `order` da tabela `Task` |
| Backend separado | Extrair Route Handlers para API Express/Fastify (o contrato REST não muda) |

---

## Resumo executivo

| Decisão | Escolha |
|---|---|
| Framework | Next.js 14 |
| Banco | PostgreSQL (Neon) |
| ORM | Prisma |
| UI | Shadcn/ui + Tailwind |
| Drag & Drop | @dnd-kit/core |
| Auth | NextAuth Credentials |
| Deploy | Vercel + Neon |
| Estrutura | Monolito |

> Um desenvolvedor com experiência em React consegue entregar esse MVP em **3 a 5 semanas** com essa stack.

---

*Plano elaborado por Arquiteto de Software Sênior — foco em simplicidade, baixo custo e profissionalismo.*
