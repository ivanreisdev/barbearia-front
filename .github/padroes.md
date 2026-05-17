# Padroes Do Projeto

## Padrao visual

- Toda tela deve seguir o mesmo padrao visual atual do sistema em modo escuro.
- Manter a identidade visual ja existente, sem trocar a linguagem do layout sem necessidade.
- Usar componentes escuros, contrastes suaves, cards, separadores discretos e estados claros de foco/hover.
- Evitar layouts genericos; quando possivel, manter a aparencia premium e funcional do SaaS.

## Responsividade

- Toda feature nova precisa ser responsiva.
- Priorizar mobile first quando houver escolha de estrutura.
- Garantir que formularios, listas, cards, modais e tabelas funcionem bem em telas pequenas e grandes.
- Evitar largura fixa quando existir alternativa flexivel.
- Usar grid, breakpoints e comportamentos adaptativos do Quasar sempre que possivel.

## Consistencia

- Reutilizar padroes de espaco, tipografia, cores e componentes ja existentes.
- Nao misturar estilos muito diferentes entre paginas.
- Manter comportamento de notificacoes, carregamento, dialogs e botoes conforme o projeto ja faz.
- Preservar a navegacao e o fluxo de autenticacao.

## Qualidade de implementacao

- Novas telas devem entrar no mesmo ecossistema do app, sem criar excecoes desnecessarias.
- Componentes grandes devem ser divididos em partes menores quando isso ajudar na manutencao.
- Dados e regras de negocio devem ficar organizados em scripts, stores ou composables, seguindo o padrao atual.
- Sempre que criar algo novo, pensar no uso real de barbearia: agendamento, servico, horario, cliente, perfil e financeiro.

