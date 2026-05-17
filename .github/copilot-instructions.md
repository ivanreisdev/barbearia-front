# Contexto do Projeto

Este projeto e o front-end de um SaaS de barbearia. O sistema serve para gerenciar:

- agendamentos
- servicos
- horarios de atendimento
- clientes
- financeiro
- despesas
- perfis e configuracoes da barbearia

## Stack atual

- Vue 3
- Quasar Framework
- Pinia
- Vue Router
- Axios
- Vite via `@quasar/app-vite`
- `vue-advanced-cropper`
- ESLint + Prettier

## Estrutura geral

- `src/pages` para telas principais
- `src/components` para componentes reutilizaveis
- `src/components/modais` para modais e dialogs
- `src/boot` para inicializacao global
- `src/stores` para estado global
- `src/scripts` e `src/pages/config/scripts` para regras de negocio e composables locais
- `src/css` para estilos globais e variaveis

## Regras importantes

- Sempre manter o modo escuro como padrao visual do sistema.
- Preservar o mesmo padrao visual ja usado no app ao criar novas telas.
- Toda nova feature ou implementacao deve ser responsiva.
- Priorizar componentes e padroes do Quasar antes de criar solucoes customizadas.
- Manter consistencia entre telas de dashboard, agendamentos, clientes, servicos e financeiro.
- Evitar quebrar o fluxo atual de autenticao, navegacao e notificacoes.
- Reutilizar componentes existentes quando fizer sentido.

## Diretrizes de implementacao

- Favor seguir a identidade visual escura, com cards, bordas suaves e contraste alto.
- Pensar primeiro no uso mobile; depois ajustar para desktop.
- Usar nomes claros e organizacao previsivel de arquivos.
- Ao criar novas paginas, manter a mesma linguagem visual dos modulos existentes.
- Quando houver duvida de layout, observar o padrao de `DashboardPage`, `AgendamentosPage` e `ServicosPage`.

