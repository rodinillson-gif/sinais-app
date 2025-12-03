# 🚀 2x WIN - Gerador de Sinais

Aplicativo web responsivo para gerenciar e monitorar sinais em tempo real com alertas antecipados.

## 📋 Requisitos

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **npm** ou **pnpm** (gerenciador de pacotes)
- **MySQL** 8.0+ (banco de dados)
- **Git** (opcional, para clonar repositório)

## 🔧 Instalação Local

### 1. Preparar o Ambiente

#### Windows
```bash
# Instalar Node.js de https://nodejs.org/
# Instalar MySQL de https://dev.mysql.com/downloads/mysql/

# Abrir PowerShell como administrador
npm install -g pnpm
```

#### Mac
```bash
# Instalar Homebrew (se não tiver)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Instalar Node.js e MySQL
brew install node mysql

# Instalar pnpm
npm install -g pnpm
```

#### Linux (Ubuntu/Debian)
```bash
# Atualizar pacotes
sudo apt update && sudo apt upgrade

# Instalar Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Instalar MySQL
sudo apt install -y mysql-server

# Instalar pnpm
npm install -g pnpm
```

### 2. Configurar Banco de Dados

#### Windows/Mac/Linux
```bash
# Iniciar MySQL
# Windows: mysql -u root -p
# Mac: mysql -u root
# Linux: sudo mysql -u root

# Criar banco de dados
CREATE DATABASE sinais_app;
CREATE USER 'sinais_user'@'localhost' IDENTIFIED BY 'sua_senha_segura';
GRANT ALL PRIVILEGES ON sinais_app.* TO 'sinais_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 3. Clonar e Instalar Projeto

```bash
# Extrair a pasta do ZIP
cd sinais-app

# Instalar dependências
pnpm install

# Criar arquivo .env
cp .env.example .env

# Editar .env com suas credenciais
# DATABASE_URL=mysql://sinais_user:sua_senha_segura@localhost:3306/sinais_app
```

### 4. Configurar Banco de Dados

```bash
# Executar migrações
pnpm db:push
```

### 5. Iniciar Desenvolvimento

```bash
# Terminal 1 - Servidor backend
pnpm dev

# Terminal 2 (opcional) - Executar testes
pnpm test
```

Acesse: **http://localhost:3000**

## 🌐 Deploy no Netlify

### Pré-requisitos
- Conta no [Netlify](https://netlify.com) (gratuita)
- Conta no [GitHub](https://github.com) (para hospedar código)
- Banco de dados MySQL na nuvem ([PlanetScale](https://planetscale.com) ou [AWS RDS](https://aws.amazon.com/rds/))

### Passo a Passo

#### 1. Preparar Banco de Dados na Nuvem

**Opção A: PlanetScale (Recomendado - Gratuito)**
```bash
# 1. Criar conta em https://planetscale.com
# 2. Criar novo database "sinais-app"
# 3. Copiar connection string
# 4. Adicionar em .env: DATABASE_URL=<connection_string>
```

**Opção B: AWS RDS**
```bash
# 1. Criar instância MySQL em https://aws.amazon.com/rds/
# 2. Configurar security group para aceitar conexões
# 3. Copiar endpoint e credenciais
# 4. Adicionar em .env: DATABASE_URL=mysql://user:pass@endpoint:3306/sinais_app
```

#### 2. Fazer Push para GitHub

```bash
# Inicializar repositório git (se não tiver)
git init
git add .
git commit -m "Initial commit: 2x WIN Sinais App"

# Criar repositório no GitHub e fazer push
git remote add origin https://github.com/seu-usuario/sinais-app.git
git branch -M main
git push -u origin main
```

#### 3. Conectar ao Netlify

```bash
# Opção A: Via CLI
npm install -g netlify-cli
netlify login
netlify init

# Opção B: Via Dashboard
# 1. Acessar https://app.netlify.com
# 2. Clicar "New site from Git"
# 3. Selecionar GitHub e autorizar
# 4. Escolher repositório "sinais-app"
# 5. Configurar build settings:
#    - Build command: pnpm build
#    - Publish directory: dist
```

#### 4. Configurar Variáveis de Ambiente

No Netlify Dashboard:
```
Site settings → Build & deploy → Environment
```

Adicionar variáveis:
```
DATABASE_URL=mysql://user:pass@host:3306/sinais_app
JWT_SECRET=sua_chave_secreta_aleatoria
VITE_APP_ID=seu_app_id
VITE_APP_TITLE=2x WIN - Sinais
```

#### 5. Deploy

```bash
# Fazer push para GitHub (dispara deploy automático)
git add .
git commit -m "Deploy changes"
git push origin main

# Ou fazer deploy manual
netlify deploy --prod
```

Seu site estará disponível em: **https://seu-site.netlify.app**

## 📱 Usar em Celular

### Android
1. Abrir navegador (Chrome, Firefox, etc)
2. Acessar: `https://seu-site.netlify.app`
3. Clicar no menu ⋮ → "Instalar app" ou "Adicionar à tela inicial"

### iPhone/iPad
1. Abrir Safari
2. Acessar: `https://seu-site.netlify.app`
3. Clicar no compartilhamento ↗️ → "Adicionar à tela inicial"

## 🎯 Uso do Aplicativo

### 1. Login
- Clicar em "Fazer Login"
- Autenticar com suas credenciais

### 2. Upload de Planilha
- Clicar em "Selecionar Arquivo" ou arrastar arquivo Excel
- Formato esperado:
  ```
  Numero | Data       | Horario  | ID
  65.50  | 2025-12-02 | 18:26:05 | 1000001
  ```

### 3. Monitorar Sinais
- Sinais aparecem organizados por hora
- Próximo sinal destacado em amarelo
- Alerta dispara 1 minuto antes do horário

### 4. Configurações
- Clicar em ⚙️ "Configurações"
- Definir multiplicador mínimo
- Ativar/desativar notificações
- Configurar webhooks (WhatsApp, Telegram, Email)

### 5. Histórico
- Clicar em 📊 "Histórico"
- Ver todos os alertas disparados
- Estatísticas de multiplicadores

## 🔔 Configurar Notificações

### Telegram
1. Criar bot no [@BotFather](https://t.me/botfather)
2. Copiar token do bot
3. Ir para @userinfobot e copiar seu Chat ID
4. Em Configurações → Adicionar Webhook → Telegram
5. Colar token e Chat ID

### WhatsApp
- Usar serviço como Twilio ou MessageBird
- Configurar webhook customizado com credenciais

### Email
- Usar SendGrid ou Mailgun
- Gerar API key
- Configurar em Configurações → Email

## 🐛 Troubleshooting

### Erro: "Database connection failed"
```bash
# Verificar conexão MySQL
mysql -u sinais_user -p -h localhost sinais_app

# Verificar DATABASE_URL em .env
# Formato: mysql://user:password@host:port/database
```

### Erro: "Port 3000 already in use"
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :3000
kill -9 <PID>
```

### Sinais não aparecem
1. Verificar formato da planilha (colunas corretas)
2. Verificar datas/horários no futuro
3. Verificar console do navegador (F12)
4. Executar: `pnpm db:push` para sincronizar banco

## 📞 Suporte

- Documentação: Consulte README.md
- Issues: Abrir issue no GitHub
- Email: suporte@2xwin.app

## 📄 Licença

MIT - Livre para uso pessoal e comercial

---

**Versão:** 1.0.0  
**Última atualização:** Dezembro 2025
