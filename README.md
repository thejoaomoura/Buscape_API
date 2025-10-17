# Buscapé API Webscraping

API para realizar webscraping do site Buscapé.

## Instalação

1. Clone o repositório
2. Instale as dependências:
```bash
npm install
```
3. Crie um arquivo .env baseado no exemplo e configure as variáveis de ambiente

## Executando o projeto

Para desenvolvimento:
```bash
npm run dev
```

Para produção:
```bash
npm start
```

## Endpoints

### 1. GET /api/search
Busca produtos no Buscapé

**Parâmetros:**
- q (obrigatório): termo de busca

**Exemplo:**
```
GET /api/search?q=notebook
```

**Resposta:**
```json
{
    "query": "notebook",
    "total": 30,
    "products": [
        {
            "name": "Nome do Produto",
            "price": "R$ 1.999,00",
            "rating": "4.5 (100)",
            "link": "https://www.buscape.com.br/produto",
            "tags": ["Indica", "Oferta"],
            "image": "url-da-imagem",
            "installment": "até 10x de R$ 199,90"
        }
    ]
}
```

### 2. GET /api/product
Obtém detalhes específicos de um produto

**Parâmetros:**
- url (obrigatório): URL completa do produto no Buscapé

**Exemplo:**
```
GET /api/product?url=https://www.buscape.com.br/produto
```

**Resposta:**
```json
{
    "name": "Nome do Produto",
    "price": "R$ 1.999,00",
    "description": "Descrição do produto",
    "specifications": {
        "Marca": "Valor",
        "Modelo": "Valor"
    },
    "merchants": [
        {
            "name": "Nome da Loja",
            "price": "R$ 1.999,00",
            "rating": "4.5",
            "shipping": "Frete Grátis"
        }
    ]
}
```

### 3. POST /api/monitor/check/:id
Verifica manualmente o preço de um produto monitorado

**Parâmetros:**
- id (obrigatório): ID do monitor

**Exemplo:**
```
POST /api/monitor/check/abc123
```

**Resposta:**
```json
{
    "success": true,
    "result": {
        "checked": true,
        "notified": false
    }
}
```

### 4. GET /api/monitor/unsubscribe/:id
Cancela o monitoramento de um produto (usado no e-mail)

## Sistema de Monitoramento de Preços

### Funcionalidades
- ✅ Monitoramento automático de preços a cada 6 horas
- ✅ Notificações por e-mail quando o preço alvo é atingido
- ✅ Interface para gerenciar produtos monitorados
- ✅ Verificação manual de preços
- ✅ Integração com Firebase Firestore
- ✅ E-mails via Resend API

### Configuração do Monitoramento

1. **Firebase Setup:**
   - Crie um projeto no [Firebase Console](https://console.firebase.google.com/)
   - Ative o Firestore Database
   - Gere uma chave de conta de serviço (Service Account)
   - Configure as variáveis de ambiente no arquivo `.env`

2. **Resend Setup:**
   - Crie uma conta em [Resend](https://resend.com/)
   - Gere uma API Key
   - Configure a variável `RESEND_API_KEY` no `.env`

3. **Variáveis de Ambiente:**
   Copie o arquivo `env.example` para `.env` e preencha:
   ```
   FIREBASE_PROJECT_ID=seu-project-id
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   FIREBASE_CLIENT_EMAIL=firebase-adminsdk@...
   RESEND_API_KEY=re_sua_chave
   EMAIL_FROM=BuscapéAPI <noreply@seudominio.com>
   ```

### Endpoints de Monitoramento

#### POST /api/monitor
Adiciona um produto ao monitoramento

**Body:**
```json
{
    "userEmail": "usuario@email.com",
    "productName": "Nome do Produto",
    "productUrl": "https://www.buscape.com.br/...",
    "currentPrice": 1500.00,
    "targetPrice": 1300.00,
    "productImage": "url-da-imagem"
}
```

#### GET /api/monitor?email=usuario@email.com
Lista todos os produtos monitorados por um e-mail

#### PUT /api/monitor/:id
Atualiza o preço alvo de um monitor

**Body:**
```json
{
    "targetPrice": 1200.00
}
```

#### DELETE /api/monitor/:id
Remove um monitoramento

## Tecnologias utilizadas

### Backend
- Node.js
- Express
- Axios
- Cheerio
- CORS
- Firebase Admin SDK
- Resend
- Node-Cron

### Frontend
- Tailwind CSS
- HeroUI V2
- Alpine.js
- Lucide Icons
