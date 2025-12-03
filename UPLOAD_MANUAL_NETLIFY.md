# 📤 Upload Manual - Netlify (Sem GitHub)

## Seu Projeto
- **URL:** https://snazzy-horse-624756.netlify.app/
- **Painel:** https://app.netlify.com/projects/snazzy-horse-624756/overview

---

## ⚠️ Importante

O Netlify não suporta drag-and-drop de pastas locais. Mas temos **3 alternativas**:

---

## Opção 1: Usar Netlify CLI (Recomendado)

### Passo 1: Instalar Netlify CLI

**Windows:**
1. Abra PowerShell como Administrador
2. Cole:
   ```powershell
   npm install -g netlify-cli
   ```

**Mac/Linux:**
```bash
npm install -g netlify-cli
```

### Passo 2: Fazer Login

```bash
netlify login
```

Isso abrirá uma janela do navegador. Faça login com sua conta Netlify.

### Passo 3: Extrair o ZIP

1. Baixe: `sinais-app-v2.0.0.zip`
2. Extraia em uma pasta (ex: `C:\Users\Seu_Usuario\sinais-app`)

### Passo 4: Preparar o Projeto

```bash
cd sinais-app

# Instalar dependências
pnpm install

# Fazer build
pnpm build
```

### Passo 5: Deploy

```bash
netlify deploy --prod --dir=dist
```

**Saída esperada:**
```
✓ Site deployed
✓ Live URL: https://snazzy-horse-624756.netlify.app
```

---

## Opção 2: Usar Netlify Drop (Mais Simples)

### Passo 1: Fazer Build Localmente

```bash
cd sinais-app
pnpm install
pnpm build
```

Isso cria uma pasta `dist` com os arquivos compilados.

### Passo 2: Acessar Netlify Drop

1. Vá para: https://app.netlify.com/drop
2. Arraste a **pasta `dist`** para a página
3. Pronto! Deploy realizado

**Saída esperada:**
```
✓ Deploy successful
✓ URL: https://seu-site.netlify.app
```

---

## Opção 3: Usar GitHub Desktop (Alternativa)

Se você tiver GitHub Desktop instalado:

### Passo 1: Criar Repositório

1. Abra GitHub Desktop
2. Clique em **File** → **New Repository**
3. Nome: `sinais-app`
4. Local: Escolha uma pasta
5. Clique em **Create Repository**

### Passo 2: Adicionar Arquivos

1. Copie todos os arquivos de `sinais-app-v2.0.0.zip` para a pasta criada
2. GitHub Desktop detectará os arquivos automaticamente
3. Clique em **Commit to main**
4. Clique em **Publish repository**

### Passo 3: Conectar ao Netlify

1. Vá para: https://app.netlify.com/projects/snazzy-horse-624756/settings/deploys
2. Clique em **Connect to Git**
3. Selecione seu repositório
4. Clique em **Deploy site**

---

## 🔧 Configurar Variáveis de Ambiente

Independentemente da opção escolhida, você PRECISA adicionar variáveis:

1. Vá para: https://app.netlify.com/projects/snazzy-horse-624756/settings/deploys
2. Procure por: **Build & deploy** → **Environment**
3. Clique em **Edit variables**
4. Adicione:

| Variável | Valor |
|----------|-------|
| `DATABASE_URL` | `mysql://usuario:senha@host/banco` |
| `JWT_SECRET` | `gere_com_openssl_rand_-base64_32` |
| `VITE_APP_TITLE` | `2x WIN - Sinais` |
| `VITE_APP_ID` | `seu_app_id` |
| `OWNER_NAME` | `Seu Nome` |
| `OWNER_OPEN_ID` | `seu_open_id` |

5. Clique em **Save**

---

## ✅ Verificar se Funcionou

1. Acesse: https://snazzy-horse-624756.netlify.app/
2. Você deve ver:
   - ✅ Página de login
   - ✅ Logo 2x WIN - Sinais
   - ✅ Campos de email e senha
   - ❌ NÃO deve ser 404

---

## 🆘 Troubleshooting

### Erro: "pnpm: command not found"

**Solução:**
```bash
npm install -g pnpm
```

### Erro: "Cannot find module"

**Solução:**
```bash
cd sinais-app
pnpm install
```

### Erro: "Build failed"

**Solução:**
1. Verifique as variáveis de ambiente
2. Certifique-se que o banco de dados está online
3. Consulte TROUBLESHOOTING_DEPLOY.md

---

## 📋 Resumo das Opções

| Opção | Dificuldade | Tempo | Melhor Para |
|-------|-------------|-------|------------|
| **CLI** | Média | 10 min | Desenvolvedores |
| **Drop** | Fácil | 5 min | Iniciantes |
| **GitHub Desktop** | Fácil | 15 min | Quem quer versionamento |

---

## 💡 Recomendação

**Recomendo a Opção 2 (Netlify Drop)** porque:
- ✅ Mais rápido (5 minutos)
- ✅ Não precisa instalar nada
- ✅ Funciona no Windows, Mac e Linux
- ✅ Ideal para testes rápidos

---

**Versão:** 2.0.0  
**Última atualização:** Dezembro 2025

Boa sorte! 🚀
