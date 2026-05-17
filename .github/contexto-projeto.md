# Contexto Do Projeto

Este repositorio contem o front-end de um SaaS de barbearia.

## Objetivo do sistema

O sistema existe para ajudar a gerir:

- agendamentos de clientes
- servicos prestados
- horarios de atendimento e bloqueios
- cadastro e detalhe de clientes
- dados da barbearia
- financeiro e despesas
- perfis e configuracoes do usuario

## Tecnologias identificadas

- `Vue 3`
- `Quasar`
- `Pinia`
- `Vue Router`
- `Axios`
- `Vite`
- `ESLint`
- `Prettier`
- `vue-advanced-cropper`

## Estrutura observada

- `src/pages` concentra as telas da aplicacao
- `src/components` concentra componentes reutilizaveis
- `src/components/modais` concentra dialogs e modais de acao
- `src/boot` concentra configuracoes globais como axios e dark mode
- `src/stores` concentra o estado global
- `src/scripts` e `src/pages/config/scripts` concentram regras de negocio e fluxos reutilizaveis
- `src/css` concentra estilos globais e variaveis do tema

## Padrao visual atual

- O projeto trabalha em modo escuro como experiencia principal.
- As telas usam bastante `q-card`, `q-input`, `q-dialog`, `q-list`, `q-item`, `q-toolbar` e `q-btn`.
- O visual atual combina fundos escuros, cards com contraste leve, blur, gradientes sutis e elementos com bordas suaves.
- Ao criar novas telas, a referencia principal deve ser o padrao ja usado em dashboard, agendamentos, clientes e servicos.

## Observacoes de arquitetura

- O app usa `Pinia` para autenticacao e estado global.
- O acesso HTTP passa por `axios` configurado em `src/boot/axios.js`.
- O dark mode e forcado na inicializacao em `src/boot/dark.js` e tambem reforcado na configuracao do Quasar.
- A navegacao principal e controlada por `vue-router`.

