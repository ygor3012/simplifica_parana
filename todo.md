# Simplifica Paraná — TODO

## Banco de Dados / Schema
- [x] Tabela `users` com campo `role` (aluno | professor)
- [x] Tabela `classrooms` (salas de aula criadas por professores)
- [x] Tabela `classroom_members` (alunos membros de salas)
- [x] Tabela `tasks` (tarefas por plataforma, sala e usuário)
- [x] Migration aplicada via drizzle-kit migrate

## Backend (tRPC Routers)
- [x] `users.setRole` — aluno ou professor no primeiro login
- [x] `classrooms.create` — professor cria sala com código aleatório
- [x] `classrooms.join` — aluno entra por código
- [x] `classrooms.list` — listar salas do usuário
- [x] `classrooms.getStudents` — professor vê alunos da sala
- [x] `tasks.add` — adicionar tarefa a uma plataforma
- [x] `tasks.list` — listar tarefas por plataforma
- [x] `tasks.toggle` — marcar/desmarcar como concluída
- [x] `tasks.delete` — excluir tarefa
- [x] `tasks.progress` — progresso por plataforma (%)
- [x] `tasks.assignToClass` — professor atribui tarefa à turma
- [x] `tasks.classProgress` — progresso geral da turma

## Frontend
- [x] Página de login / seleção de papel (aluno/professor)
- [x] Layout principal com header (logo + nav)
- [x] Banner de cabeçalho com imagem
- [x] Dashboard com 9 cards circulares de plataformas
- [x] Badge vermelho de alerta em cards com tarefas pendentes
- [x] Card de progresso total (SVG circular)
- [x] Modal/painel de tarefas por plataforma
- [x] Adicionar, concluir e excluir tarefas
- [x] Painel exclusivo do professor
  - [x] Criar sala / visualizar código
  - [x] Ver alunos da sala
  - [x] Atribuir tarefas à turma
  - [x] Acompanhar progresso da turma
- [x] Página de salas do aluno (entrar por código)
- [x] Responsividade e micro-interações
- [x] Página de todas as atividades com filtros

## Assets Visuais
- [x] Logo Simplifica Paraná (gerado com IA)
- [x] Banner de cabeçalho (gerado com IA)

## Testes
- [x] 11 testes vitest passando (auth, users, classrooms, tasks)

## Entrega
- [x] Checkpoint salvo
- [x] Site entregue ao usuário

## Melhorias Concluídas
- [x] Substituir emojis dos cards por logos reais das plataformas educacionais

## Bugs Corrigidos
- [x] Criar página de perfil do usuário em /perfil

## Refatoração em Andamento
- [ ] Refatorar banco de dados: criar entidades separadas para students e teachers
- [ ] Atualizar autenticação para vincular email a apenas um tipo de usuário
- [ ] Migrar dados existentes e atualizar routers
