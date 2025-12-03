# 🚀 Guia Final - Deploy 2x WIN Sinais no Netlify

## Seu Site Atual
- **URL:** https://frabjous-piroshki-525d65.netlify.app/
- **Painel:** https://app.netlify.com/projects/frabjous-piroshki-525d65/overview

---

## ✅ Pré-requisitos

Você precisa ter:
- ✅ Conta no Netlify (já tem)
- ✅ Repositório GitHub com o código (ou criar um novo)
- ✅ Banco de dados MySQL na nuvem (PlanetScale, AWS RDS, etc)

---

## 📋 Passo 1: Preparar o Banco de Dados

### Opção A: PlanetScale (Recomendado - Gratuito)

1. Acesse: https://planetscale.com
2. Faça login ou crie conta
3. Crie um novo database chamado `sinais-app`
4. Clique em "Connect" → "Node.js"
5. Copie a connection string (exemplo):
   ```
   mysql://user:password@aws.connect.psdb.cloud/sinais-app?sslaccept=strict
   ```

### Opção B: AWS RDS

1. Crie uma instância MySQL
2. Copie o endpoint (exemplo):
   ```
   mysql://user:password@sinais-db.123456.us-east-1.rds.amazonaws.com:3306/sinais-app
   ```

---

## 📋 Passo 2: Configurar Variáveis de Ambiente no Netlify

1. Abra: https://app.netlify.com/projects/frabjous-piroshki-525d65/settings/deploys
2. Procure por: **Build & deploy** → **Environment**
3. Clique em **Edit variables**
4. Adicione estas variáveis:

| Variável | Valor | Exemplo |
|----------|-------|---------|
| `DATABASE_URL` | Connection string do seu banco | `mysql://user:pass@host/db` |
| `JWT_SECRET` | Chave aleatória de 32 caracteres | `gere_com_openssl_rand_-base64_32` |
| `VITE_APP_TITLE` | Título do app | `2x WIN - Sinais` |
| `VITE_APP_ID` | ID da aplicação Manus | `seu_app_id` |
| `OWNER_NAME` | Seu nome | `Seu Nome` |
| `OWNER_OPEN_ID` | OpenID do Manus | `seu_open_id` |

**Como gerar JWT_SECRET:**
- Linux/Mac: `openssl rand -base64 32`
- Windows: Use https://www.random.org/strings/ (32 caracteres)

5. Clique em **Save**

---

## 📋 Passo 3: Fazer Push do Código para GitHub

### Se você já tem repositório:

```bash
cd sinais-app
git add .
git commit -m "Deploy v2.0.0 - Dados ocultos, indicador 10x++"
git push origin main
```

### Se você NÃO tem repositório:

```bash
# 1. Criar repositório no GitHub
# Acesse: https://github.com/new
# Nome: sinais-app
# Descrição: 2x WIN - Gerador de Sinais

# 2. No seu computador
cd sinais-app
git init
git add .
git commit -m "Initial commit - 2x WIN Sinais v2.0.0"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/sinais-app.git
git push -u origin main
```

---

## 📋 Passo 4: Conectar GitHub ao Netlify

1. Abra: https://app.netlify.com/projects/frabjous-piroshki-525d65/settings/deploys
2. Procure por: **Build & deploy** → **Continuous Deployment**
3. Clique em **Connect to Git**
4. Selecione **GitHub**
5. Autorize o Netlify
6. Selecione seu repositório `sinais-app`
7. Clique em **Deploy site**

---

## 📋 Passo 5: Monitorar o Deploy

1. Vá para: https://app.netlify.com/projects/frabjous-piroshki-525d65/deploys
2. Procure pelo deploy mais recente
3. Clique nele para ver o **Build log**
4. Procure por:
   - ✅ "Build complete" = Sucesso!
   - ❌ Mensagens de erro em vermelho = Problema

**Erros Comuns:**

| Erro | Solução |
|------|---------|
| `DATABASE_URL is not defined` | Adicione em Environment |
| `JWT_SECRET is not defined` | Adicione em Environment |
| `Cannot find module 'xlsx'` | Verifique `package.json` |
| `Build timed out` | Banco de dados muito lento |

---

## 📋 Passo 6: Testar o Site

1. Acesse: https://frabjous-piroshki-525d65.netlify.app/
2. Você deve ver a página de login
3. Se vir 404, volte ao **Passo 5** e verifique o build log

---

## 🎯 Funcionalidades Implementadas

✅ **Upload de Planilha Excel**
- Suporta acentos (Número, Horário)
- Validação automática de formato
- Armazenamento seguro no banco

✅ **Monitoramento em Tempo Real**
- Alertas 1 minuto antes do horário
- Notificações visuais e sonoras
- Botão conectar/desconectar

✅ **Dados Ocultos**
- Apenas próximo alerta visível
- Multiplicador com indicador "10x ++"
- Planilha não pode ser baixada

✅ **Histórico de Alertas**
- Registro de todos os sinais disparados
- Filtros por multiplicador
- Estatísticas de acertos

✅ **Webhooks**
- Notificações via WhatsApp, Telegram, Email
- Integração com APIs customizadas

---

## 🆘 Troubleshooting

### Site mostra 404

1. Verifique o build log em Netlify
2. Certifique-se que todas as variáveis de ambiente foram adicionadas
3. Clique em **Trigger deploy** → **Clear cache and retry**

### Banco de dados não conecta

1. Verifique a `DATABASE_URL`
2. Certifique-se que o banco está acessível da internet
3. Para PlanetScale: ative SSL em Configurações

### Alertas não funcionam

1. Faça upload de uma planilha com dados
2. Clique em "Conectado" para ativar monitoramento
3. Aguarde 1 minuto antes do horário do sinal

---

## 📞 Suporte

- **Netlify Docs:** https://docs.netlify.com/
- **Netlify Support:** https://support.netlify.com/
- **PlanetScale Docs:** https://planetscale.com/docs

---

## ✨ Próximas Melhorias Sugeridas

1. **Notificações Push:** Configure Web Push API para alertar mesmo com aba fechada
2. **Integração Telegram:** Envie mensagens automáticas com detalhes do sinal
3. **Dashboard Analytics:** Gráficos de tendência e taxa de acerto

---

**Versão:** 2.0.0  
**Última atualização:** Dezembro 2025

Boa sorte! 🚀
