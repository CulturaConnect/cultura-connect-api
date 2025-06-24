# Cultura Connect API 🎭

API REST construída com Node.js, Express e Sequelize para facilitar o gerenciamento de projetos culturais.

## ✨ Recursos

- Autenticação JWT via [better-auth](https://www.better-auth.com)
- Cadastro de pessoas e empresas
- Upload de imagens diretamente para o Amazon S3
- Controle de status e orçamento de projetos
- Notificações por e-mail e na API
- Documentação Swagger disponível em `/docs`

## 🚀 Primeiros passos

1. Clone este repositório
2. Crie um arquivo `.env` seguindo o modelo abaixo
3. Execute `npm install` para instalar as dependências

### Variáveis de ambiente

```bash
DATABASE_URL=postgres://user:pass@localhost:5432/cultura
MAIL_USER=seu-email@gmail.com
MAIL_PASS=senha-ou-token
AWS_ACCESS_KEY_ID=sua-chave
AWS_SECRET_ACCESS_KEY=seu-segredo
AWS_REGION=us-east-1
S3_BUCKET_NAME=nome-do-bucket
JWT_SECRET=segredo-do-jwt
TOKEN_EXPIRY=7d
PORT=3000
```

### Executando

```bash
# Ambiente de produção
npm start

# Ambiente de desenvolvimento
npm run dev
```

A primeira execução criará as tabelas no banco configurado. Certifique-se de que o PostgreSQL está em execução.

## 📚 Endpoints resumidos

### Auth
- `POST /auth/register/person` – cadastra pessoa física
- `POST /auth/register/company` – cadastra empresa
- `POST /auth/login` – autentica usuário
- `GET /auth/profile` – retorna perfil
- `PUT /auth/profile` – atualiza perfil
- `POST /auth/recover` – envia código de recuperação
- `POST /auth/reset` – redefine senha
- `POST /auth/check-code` – valida código

### Projects
- `POST /projects` – cria projeto (aceita `multipart/form-data` para imagem)
- `GET /projects` – lista projetos
- `GET /projects/{id}` – obtém projeto por ID
- `PATCH /projects/{id}` – atualiza projeto
- `DELETE /projects/{id}` – remove projeto
- `POST /projects/{id}/imagem` – upload de imagem

### Companies
- `GET /companies/{id}/users` – lista membros
- `POST /companies/{id}/users` – associa usuário

### Users
- `GET /users/search?cpf=` – busca por CPF

### Notifications
- `GET /notifications/{userId}` – lista notificações do usuário

Para detalhes completos acesse `http://localhost:3000/docs` após iniciar o servidor.

---

Aproveite para integrar sua equipe e impulsionar seus projetos culturais! 🚀
