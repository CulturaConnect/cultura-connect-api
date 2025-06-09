# Cultura Connect API

API em Node.js utilizando Express para autenticação de usuários.

## Configuração

Crie um arquivo `.env` ou defina as seguintes variáveis de ambiente:

- `DATABASE_URL` – string de conexão com o PostgreSQL.
- `MAIL_USER` – conta de e-mail (ex. Gmail) utilizada para envio dos códigos de recuperação.
- `MAIL_PASS` – senha ou token dessa conta.

Execute `npm install` para instalar as dependências e então inicie o servidor com:

```bash
node src/index.js
```

A API utilizará o banco PostgreSQL configurado e enviará e-mails via o serviço definido.
