# ⚡ Guia Rápido - 2x WIN Sinais

## 🚀 Começar em 5 Minutos

### Passo 1: Extrair ZIP
```bash
# Windows: Clicar com botão direito → Extrair tudo
# Mac/Linux: unzip sinais-app-v1.0.0.zip
cd sinais-app
```

### Passo 2: Instalar Dependências
```bash
npm install -g pnpm  # Se não tiver pnpm
pnpm install
```

### Passo 3: Configurar Banco de Dados
```bash
# Criar banco MySQL (local ou nuvem)
# Atualizar DATABASE_URL em .env
# Exemplo: mysql://user:pass@localhost:3306/sinais_app
```

### Passo 4: Iniciar Aplicação
```bash
pnpm db:push    # Criar tabelas
pnpm dev        # Iniciar servidor
```

### Passo 5: Acessar
- Abrir navegador: **http://localhost:3000**
- Login com suas credenciais
- Fazer upload de planilha Excel

---

## 📱 Usar em Celular

### Android
1. Abrir Chrome
2. Acessar seu site (local ou Netlify)
3. Menu ⋮ → "Instalar app"

### iPhone
1. Abrir Safari
2. Acessar seu site
3. Compartilhar ↗️ → "Adicionar à tela inicial"

---

## 🌐 Deploy no Netlify (Gratuito)

### Opção Fácil: Via GitHub
```bash
# 1. Criar conta GitHub (gratuito)
# 2. Fazer push do código
git init
git add .
git commit -m "Initial commit"
git push origin main

# 3. Conectar ao Netlify
# - Ir para https://app.netlify.com
# - Clicar "New site from Git"
# - Selecionar seu repositório
# - Configurar variáveis de ambiente
# - Deploy automático!
```

---

## 📊 Formato da Planilha

Seu arquivo Excel deve ter estas colunas:

| Numero | Data | Horario | ID |
|--------|------|---------|-----|
| 65.50 | 2025-12-02 | 18:26:05 | 1000001 |
| 81.00 | 2025-12-02 | 18:27:05 | 1000002 |
| 96.50 | 2025-12-02 | 18:28:05 | 1000003 |

**Importante:**
- Numero: Multiplicador (ex: 65.50)
- Data: Formato YYYY-MM-DD
- Horario: Formato HH:MM:SS
- ID: Identificador único

---

## 🔔 Configurar Notificações

### Telegram (Recomendado)
1. Abrir [@BotFather](https://t.me/botfather)
2. Enviar `/newbot` e criar bot
3. Copiar token
4. Abrir [@userinfobot](https://t.me/userinfobot) → copiar Chat ID
5. Em Configurações → Webhook Telegram → colar token e Chat ID

### Email
1. Criar conta SendGrid (gratuito)
2. Gerar API key
3. Em Configurações → Webhook Email → colar API key

---

## ❓ Dúvidas Frequentes

### P: Sinais não aparecem?
**R:** Verifique:
- Formato da planilha (colunas corretas)
- Datas/horários no futuro
- Banco de dados conectado (`pnpm db:push`)

### P: Erro ao fazer upload?
**R:** Certifique-se:
- Arquivo é .xlsx ou .xls
- Colunas têm nomes corretos
- Não há linhas vazias no início

### P: Alerta não dispara?
**R:** Verifique:
- Horário está no futuro
- Notificações ativadas em Configurações
- Navegador aberto na página de sinais

### P: Posso usar em produção?
**R:** Sim! Deploy no Netlify:
- Gratuito até 300 minutos/mês
- Banco de dados: PlanetScale (gratuito)
- Domínio customizado: $12/mês

---

## 📞 Precisa de Ajuda?

1. Consulte **INSTALACAO.md** para instruções completas
2. Consulte **SETUP.md** para configuração de variáveis
3. Verifique console do navegador (F12) para erros
4. Verifique logs do servidor (`pnpm dev`)

---

**Versão:** 1.0.0  
**Última atualização:** Dezembro 2025

Aproveite! 🎉
