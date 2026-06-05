# Auth Email OTP Documentation

## Rotas cobertas
- `POST /register`
- `POST /verify-email/{user_id}`
- `POST /resend-otp`

---

## `POST /register`

### Payload
{
  "nome": "string",
  "email": "string",
  "password": "string",
  "password_confirmation": "string",
  "role": "admin|barbeiro",
  "telefone": "string",
  "codigo_vinculacao": "string", // required se role=barbeiro
  "barbearia": {
    "nome": "string", // required se role=admin
    "endereco": {
      "rua": "string",
      "numero": "string",
      "bairro": "string",
      "cidade": "string",
      "uf": "string", // 2 caracteres
      "complemento": "string|null"
    }
  }
}

### Response de sucesso
Status: `200`

{
  "tipo": "sucesso",
  "mensagem": "Usuário registrado. Verifique seu email para o código OTP.",
  "user_id": 123,
  "email": "user@example.com"
}

### Erros possíveis
- `422` Validação de campos
- `400` Código de vinculação inválido
  - `{ "tipo": "erro", "msg": "Código de vinculação inválido." }`
- `500` Falha ao enviar email de verificação
  - `{ "tipo": "erro", "msg": "Erro ao enviar email de verificação." }`
- `500` Erro interno ao registrar usuário
  - `{ "tipo": "erro", "msg": "Erro ao registrar usuário.", "erro": "<mensagem>" }`

---

## `POST /verify-email/{user_id}`

### Payload
{
  "codigo": "string"
}

### Parâmetro de rota
- `user_id`: id do usuário registrado

### Response de sucesso
Status: `200`

{
  "user": { ... },
  "token": "<jwt-token>",
  "token_type": "bearer",
  "expires_in": 3600
}

### Erros possíveis
- `404` Usuário não encontrado
  - `{ "error": "Usuário não encontrado" }`
- `401` Código inválido
  - `{ "error": "Código inválido" }`
- `401` Código expirado
  - `{ "error": "Código expirado gere um novo codigo" }`
- `429` Bloqueio por tentativas inválidas
  - `{ "error": "Bloqueado. Tente novamente em X segundos." }`

### Regras de validação
- O código é verificado apenas em registros `CadastroEmailVerificacao` com `status = pendente`
- O código expira em 10 minutos
- O bloqueio é ativado após 3 tentativas inválidas
- O contador de tentativas é limpo apenas após verificação bem sucedida

---

## `POST /resend-otp`

### Payload
{
  "user_id": 123,
  "email": "user@example.com"
}

### Response de sucesso
Status: `200`

{
  "tipo": "sucesso",
  "mensagem": "Código reenviado com sucesso."
}

### Erros possíveis
- `404` Usuário não encontrado
  - `{ "error": "Usuário não encontrado" }`
- `400` Email não corresponde ao usuário
  - `{ "error": "Email não corresponde ao usuário" }`
- `500` Falha ao enviar email de verificação
  - `{ "tipo": "erro", "msg": "Erro ao enviar email de verificação." }`

### Observações
- Gera um novo código OTP e envia por email
- Não retorna JWT
- O código anterior é substituído no banco
- O bloqueio por tentativas inválidas permanece se já estiver ativo


## Fluxo de validação de email

1. Usuário envia `POST /register`
2. Back-end cria usuário e gera código OTP
3. Email é enviado com o código
4. Usuário digita o código no front-end
5. `POST /verify-email/{user_id}` valida o OTP
6. Se válido, o sistema retorna JWT e marca email como verificado

### Reenvio de código
- Se o usuário não receber o email ou o código expirar, usar `POST /resend-otp`
- O front-end deve permitir reenviar o código e informar que ele será válido por 10 minutos

### Mensagens importantes para o front-end
- `Usuário registrado. Verifique seu email para o código OTP.`
- `Código inválido`
- `Código expirado gere um novo codigo`
- `Bloqueado. Tente novamente em X segundos.`
- `Código reenviado com sucesso.`
