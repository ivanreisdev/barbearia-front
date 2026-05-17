A tela de registro já se encontra funcional no sistema, permitindo o cadastro de novos usuários por meio dos seguintes campos iniciais:

Nome
E-mail
Telefone
Senha
🔧 Ajustes e Novos Campos
➕ Inclusão de Sobrenome

Será adicionado um novo campo obrigatório:

Sobrenome

Este campo complementa o cadastro do usuário, mantendo consistência com dados pessoais mais completos.

👤 Tipo de Usuário (Rule)

A tela possui um seletor de tipo de usuário com as seguintes opções:

Barbeiro
Admin
🧑‍🔧 Quando selecionado "Barbeiro":

Será exibido um campo adicional:

Código de vinculação da barbearia

Esse código permitirá associar o barbeiro a uma barbearia já existente no sistema.

🧑‍💼 Quando selecionado "Admin":

Serão exibidos campos adicionais para criação de uma nova barbearia:

Nome da barbearia
Endereço completo, contendo:
Rua
Número
Bairro
Cidade
Estado / UF
(Outros campos complementares, se necessário)

O campo Estado / UF deve ser disponibilizado como um seletor com todas as UFs do Brasil:

AC
AL
AP
AM
BA
CE
DF
ES
GO
MA
MT
MS
MG
PA
PB
PR
PE
PI
RJ
RN
RS
RO
RR
SC
SP
SE
TO

Esses campos devem aparecer dinamicamente ao selecionar a opção "Admin".

No envio da requisição, o endereço da barbearia deve ser enviado como objeto estruturado, sem agrupar todos os campos em uma única string.

Exemplo:

barbearia: {
  nome: "Nome da barbearia",
  endereco: {
    rua: "Rua exemplo",
    numero: "123",
    bairro: "Centro",
    cidade: "Maringá",
    uf: "PR",
    estado: "PR",
    complemento: "Sala 2"
  }
}

📱 Formatação de Telefone
O campo de telefone deve aplicar máscara de formatação em tempo real conforme o usuário digita (ex: (44) 99999-9999).
No momento do envio da requisição, o valor deve ser normalizado, removendo caracteres especiais (ex: 44999999999).
🎨 Layout e Consistência Visual
Todas as alterações devem seguir o layout padrão já existente no sistema, mantendo consistência visual e de usabilidade.
Nenhuma quebra de padrão de design deve ser introduzida.
🛠️ Melhoria de UX (Autocomplete de Senhas)
Problema Atual:

Ao utilizar autocomplete de senhas (ex: Google Chrome), os inputs sofrem alterações visuais indesejadas (como mudança de cor de fundo).

Solução Esperada:
Garantir que os campos preenchidos automaticamente não sofram alteração visual.
Manter o mesmo estilo aplicado aos inputs, independentemente do uso de autocomplete.
