## ChatWeb (front básico para testar o `ai-framework`)

Front-end simples (Vite + React + TypeScript) com:

- **Tela de abertura**: informa `companyId`, `customerPhone` e (opcional) `customerName`.
- **Tela de conversa**: lista de mensagens + input no rodapé para enviar texto e ver a resposta da IA.

Ele integra com o backend do `ai-framework` usando **`simple`** ou **`zibb-teste`**:

- `POST /v1/messages/{provider}/{company_id}`
- Body mínimo: `{ "message": "...", "customer_phone": "..." }`

`zibb-teste` usa a entrada e a resposta do `simple`. No contexto das funções, ele aparece como `provider=zibb`, de modo que lojas, horários, reserva e registro do pedido usem as integrações reais da Zibb. **O pedido é gravado na Zibb e a janela escolhida é reservada/confirmada de verdade.** Apenas o disparo de mensagens WhatsApp fica desativado. Não exige número conectado. O endpoint é protegido por um token de teste no servidor e só aceita a empresa configurada.
Como no modo `simple`, a conversa cria customer, thread e pedido na base DW. Use dados de teste e identifique os pedidos de teste na operação da loja.

### Testar a Zona Sul sem número conectado

1. Na Zibb, como owner/admin da Zona Sul, abra **Configurações → Desenvolvedor → Chaves e endpoints → Nova chave**. Crie uma chave exclusiva para o ChatWeb. Ela é exibida uma única vez. Não vincule a um bot ou número de WhatsApp.
2. No `ai-framework/.env` **local**, configure `ZIBB_CHATWEB_TEST_API_KEY` com a chave criada na Zibb. `ZIBB_CHATWEB_TEST_COMPANY_ID`, `CHATWEB_TEST_TOKEN` e `AI_FRAMEWORK_BACKGROUND_JOBS=false` já foram preparados nesta máquina. Mantenha as configurações locais já usadas para banco, Redis, OpenAI e Algolia. Não coloque a chave Zibb no front. `ZIBB_CREDENTIAL_ENCRYPTION_KEY` deve ter o mesmo valor do `dw_admin_api` para testar posteriormente a chave oficial. As rotinas automáticas de encerramento de threads e renovação geral de reservas ficam desligadas no processo local; reservas da conversa continuam funcionando.
3. Inicie o `ai-framework` **na sua máquina**, dentro da pasta do projeto, com `uv run uvicorn app.api.main:app --host 127.0.0.1 --port 8008 --reload`. Confirme `http://127.0.0.1:8008/health_check` antes de iniciar o ChatWeb.
4. O arquivo local `chatweb/.env.local` já contém `CHATWEB_TEST_TOKEN` com o mesmo valor do `ai-framework/.env`. **Não** use prefixo `VITE_` para segredos. Reinicie o Vite se alterar qualquer um dos arquivos `.env`.
5. Inicie o ChatWeb com `npm install` e `npm run dev`. Escolha **API: DEV (proxy → 127.0.0.1:8008)**, **Tipo de teste: Zibb (pedido real, sem disparo de mensagens)** e **Company: Zona Sul**. Informe telefone e nome de teste; o CPF é solicitado na conversa. A requisição passa pelo proxy Vite para o backend local, que chama Zibb e `dw_admin_api` em produção.
6. Na conversa, informe um endereço coberto pela Matriz, selecione a loja retornada, consulte e escolha uma janela, adicione produtos e finalize com pagamento offline. Confirme o resultado pelo `external_id` retornado e pelo pedido criado na Zibb. Uma compra de teste ocupa a janela e aparece no painel de pedidos.

O provider `zibb-teste` sempre chama o `ai-framework` local. Quando o número for conectado, a ativação normal do **Chatbot DW** na Zibb enviará outra chave ao `dw_admin_api`; o provider real `zibb` usará essa chave no banco. A chave manual de teste poderá ser removida do `.env` local e revogada na Zibb; o ChatWeb continuará apto a testar reservas e pedidos com a chave oficial, mantendo a autenticação separada do teste.

### Requisitos

- Node.js 18+ (recomendado)
- Backend `ai-framework` rodando em `http://127.0.0.1:8008`

### Como rodar

No diretório `chatweb/`:

```bash
npm install
npm run dev
```

Abra o navegador no endereço impresso pelo Vite (normalmente `http://localhost:5173`).

### Proxy (evita CORS no dev)

O projeto já vem com proxy no `vite.config.ts`:

- chamadas do front para `/v1/...` são encaminhadas para `http://127.0.0.1:8008`

Se seu backend estiver em outra URL/porta, ajuste o `target` em `vite.config.ts`.

### Fluxo de uso

1. Preencha o formulário inicial:
   - **Tipo de teste**: escolha `Simple` ou `Zibb (pedido real, sem disparo de mensagens)`
   - **Company ID**: UUID da empresa no seu banco
   - **Telefone**: use somente dígitos (ex: `5511999999999`)
   - **Nome (opcional)**: ajuda a criar o customer no provider `simple`
2. Clique em **Iniciar conversa**
3. Envie mensagens no chat (Enter envia, Shift+Enter quebra linha)

### Observações

- Os dois modos criam o customer automaticamente se não existir (por `customer_phone`).
- A UI tenta renderizar a resposta usando `data.disparo.answer` (array normalizado) e faz fallback para `data.assistant_response.answer`.

