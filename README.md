# hackaton-soat-notification

Projeto Node.js para AWS Lambda que envia e-mails usando Amazon SES, com suporte a templates de e-mail usando Handlebars.

## Estrutura

- `src/lambda.ts`: Função Lambda principal
- `src/test.ts`: Script para testar localmente
- `src/templates/`: Pasta para templates de e-mail (Handlebars)
- `.env.example`: Exemplo de variáveis de ambiente

## Usando templates de e-mail (Handlebars)

Coloque seus arquivos de template na pasta `src/templates` com extensão `.hbs`.
No evento da Lambda, envie os campos `templateName` (nome do arquivo sem `.hbs`) e `templateData` (objeto com variáveis para o template):

```ts
await handler({
	to: "destinatario@exemplo.com",
	subject: "Bem-vindo!",
	templateName: "welcome",
	templateData: { name: "Usuário" },
});
```

## Como usar

1. Instale as dependências:
    ```bash
    npm install
    ```
2. Copie `.env.example` para `.env` e preencha com seus dados.
3. Compile o projeto:
    ```bash
    npm run build
    ```
4. Teste localmente:
    ```bash
    npm start
    ```

## Deploy

Implemente a função Lambda na AWS e configure as variáveis de ambiente `MY_APP_REGION`, `SES_FROM_EMAIL` e `COGNITO_USER_POOL_ID` no ambiente da Lambda.

## Observações

- O e-mail de origem (`SES_FROM_EMAIL`) deve estar verificado no SES.
- O pool de usuários do Cognito deve estar configurado para permitir a leitura dos dados do usuário.
- Para produção, proteja suas variáveis de ambiente.
- Se não informar `templateName`, será enviado o campo `body` como texto simples.
