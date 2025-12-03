# ⚙️ Configuração de Variáveis de Ambiente

## 📝 Variáveis Necessárias

### Banco de Dados
```
DATABASE_URL=mysql://usuario:senha@host:porta/banco_de_dados
```

**Exemplos:**
- **Local:** `mysql://sinais_user:sua_senha@localhost:3306/sinais_app`
- **PlanetScale:** `mysql://user:password@aws.connect.psdb.cloud/sinais_app?sslaccept=strict`
- **AWS RDS:** `mysql://user:pass@seu-endpoint.rds.amazonaws.com:3306/sinais_app`

### Autenticação
```
JWT_SECRET=sua_chave_secreta_aleatoria_muito_segura_aqui
```

**Como gerar:**
- Linux/Mac: `openssl rand -base64 32`
- Windows: Use gerador online ou 1Password

### Aplicação
```
VITE_APP_TITLE=2x WIN - Gerador de Sinais
VITE_APP_LOGO=/logo.png
```

### OAuth (Opcional)
```
VITE_APP_ID=seu_app_id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im
```

### Proprietário
```
OWNER_NAME=Seu Nome
OWNER_OPEN_ID=seu_identificador_unico
```

## 🔧 Como Configurar Localmente

### 1. Copiar arquivo de exemplo
```bash
cp .env.example .env
```

### 2. Editar .env com suas credenciais
```bash
# Windows: Abrir com Notepad
notepad .env

# Mac/Linux: Abrir com editor
nano .env
```

### 3. Preencher variáveis
```env
DATABASE_URL=mysql://sinais_user:sua_senha@localhost:3306/sinais_app
JWT_SECRET=gerado_com_openssl_rand_base64_32
VITE_APP_TITLE=2x WIN - Sinais
OWNER_NAME=Seu Nome
```

### 4. Salvar e testar
```bash
pnpm db:push
pnpm dev
```

## 🌐 Como Configurar no Netlify

### 1. Acessar Dashboard
- Ir para https://app.netlify.com
- Selecionar seu site
- Ir para **Site settings** → **Build & deploy** → **Environment**

### 2. Adicionar variáveis
Clicar em **Edit variables** e adicionar:

| Chave | Valor |
|-------|-------|
| `DATABASE_URL` | `mysql://user:pass@host:3306/db` |
| `JWT_SECRET` | Sua chave secreta |
| `VITE_APP_TITLE` | `2x WIN - Sinais` |
| `OWNER_NAME` | Seu nome |

### 3. Redeploy
- Clicar em **Deploys** → **Trigger deploy**
- Ou fazer push para GitHub (deploy automático)

## 🔐 Variáveis para Webhooks (Opcional)

### Telegram
```
TELEGRAM_BOT_TOKEN=seu_bot_token
TELEGRAM_CHAT_ID=seu_chat_id
```

**Como obter:**
1. Abrir [@BotFather](https://t.me/botfather) no Telegram
2. Enviar `/newbot` e seguir instruções
3. Copiar token
4. Abrir [@userinfobot](https://t.me/userinfobot) e copiar Chat ID

### SendGrid (Email)
```
SENDGRID_API_KEY=sua_api_key
SENDGRID_FROM_EMAIL=noreply@seu-dominio.com
```

**Como obter:**
1. Criar conta em https://sendgrid.com
2. Ir para **Settings** → **API Keys**
3. Criar nova API key
4. Copiar e guardar com segurança

### Twilio (WhatsApp)
```
TWILIO_ACCOUNT_SID=seu_account_sid
TWILIO_AUTH_TOKEN=seu_auth_token
TWILIO_PHONE_NUMBER=+55XXXXXXXXXX
```

**Como obter:**
1. Criar conta em https://www.twilio.com
2. Ir para **Account** → **API Credentials**
3. Copiar Account SID e Auth Token
4. Configurar número WhatsApp em **Messaging** → **Services**

## ✅ Checklist de Configuração

- [ ] Banco de dados criado e testado
- [ ] DATABASE_URL configurada corretamente
- [ ] JWT_SECRET gerada e configurada
- [ ] VITE_APP_TITLE definido
- [ ] OWNER_NAME e OWNER_OPEN_ID configurados
- [ ] Arquivo .env criado localmente
- [ ] `pnpm db:push` executado com sucesso
- [ ] `pnpm dev` iniciando sem erros
- [ ] Aplicativo acessível em http://localhost:3000
- [ ] Variáveis adicionadas ao Netlify (se deploy)
- [ ] Deploy no Netlify bem-sucedido

## 🆘 Troubleshooting

### Erro: "Cannot find module .env"
```bash
# Criar arquivo .env
touch .env
# Copiar conteúdo de .env.example
```

### Erro: "Database connection failed"
```bash
# Verificar DATABASE_URL
# Testar conexão MySQL manualmente
mysql -u usuario -p -h host banco_de_dados
```

### Erro: "JWT_SECRET is not defined"
```bash
# Gerar nova chave
openssl rand -base64 32

# Adicionar ao .env
JWT_SECRET=sua_chave_gerada
```

### Variáveis não aparecem no Netlify
1. Verificar se foram salvas em **Environment**
2. Fazer **Trigger deploy** novamente
3. Verificar em **Build log** se variáveis foram injetadas

---

**Dúvidas?** Consulte INSTALACAO.md para instruções completas de setup.
