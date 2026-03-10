# hackaton-soat-notification

Projeto Node.js para AWS Lambda que envia e-mails usando Amazon SES, com suporte a templates de e-mail via Handlebars.

## Estrutura do Projeto

- `src/lambda.ts`: Função principal da AWS Lambda para envio de e-mails.
- `src/templateService.ts`: Serviço responsável por carregar e compilar templates Handlebars.
- `src/templates/`: Pasta com templates de e-mail (`.hbs`).
    - `error-notification.hbs`
    - `success-notification.hbs`

## Como usar templates de e-mail (Handlebars)

1. Adicione seus templates na pasta `src/templates` com extensão `.hbs`.
2. No evento da Lambda, envie os campos:
    - `to`: destinatário
    - `subject`: assunto do e-mail
    - `templateName`: nome do template (sem `.hbs`)
    - `templateData`: objeto com variáveis para o template

Exemplo de chamada:

```ts
await handler({
	to: "destinatario@exemplo.com",
	subject: "Bem-vindo!",
	templateName: "welcome",
	templateData: { name: "Usuário" },
});
```
