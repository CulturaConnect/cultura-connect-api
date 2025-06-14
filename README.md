# Cultura Connect API

API em Node.js utilizando Express para autenticação de usuários.

## Configuração

Crie um arquivo `.env` ou defina as seguintes variáveis de ambiente:

- `DATABASE_URL` – string de conexão com o PostgreSQL.
- `MAIL_USER` – conta de e-mail (ex. Gmail) utilizada para envio dos códigos de recuperação.
- `MAIL_PASS` – senha ou token dessa conta.

Execute `npm install` para instalar as dependências. Para iniciar o servidor em 
produção utilize:

```bash
npm start
```

Durante o desenvolvimento é possível executar com recarregamento automático util
izando:

```bash
npm run dev
```

Na primeira execução, o `sequelize.sync()` criará automaticamente as tabelas
definidas em `src/models`. Certifique-se de que o banco configurado está ativo
para que tabelas como `company_users` e `projects` sejam criadas corretamente.

A API utilizará o banco PostgreSQL configurado e enviará e-mails via o serviço definido.

## Documentação Swagger

Após iniciar o servidor acesse `http://localhost:3000/docs` para visualizar a documentação interativa dos endpoints.
