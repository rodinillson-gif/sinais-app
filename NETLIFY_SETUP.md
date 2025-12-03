# 🚀 Guia Completo - Deploy no Netlify

## Seu Site
- **URL:** https://frabjous-piroshki-525d65.netlify.app/
- **Painel:** https://app.netlify.com/projects/frabjous-piroshki-525d65/overview

---

## ⚠️ Problema Atual: Erro 404

O erro 404 significa que o site não foi buildado corretamente. Vamos resolver!

---

## 🔧 Solução em 5 Passos

### Passo 1: Adicionar Variáveis de Ambiente

1. Abra: https://app.netlify.com/projects/frabjous-piroshki-525d65/settings/deploys
2. Procure por: **Build & deploy** → **Environment**
3. Clique em **Edit variables**
4. Adicione estas variáveis (OBRIGATÓRIO):

```
DATABASE_URL = mysql://seu_usuario:sua_senha@seu_host:3306/seu_banco
JWT_SECRET = gere_uma_chave_aleatoria_com_32_caracteres
VITE_APP_TITLE = 2x WIN - Sinais
VITE_APP_ID = seu_app_id
OWNER_NAME = Seu Nome
OWNER_OPEN_ID = seu_open_id
```

**Como gerar JWT_SECRET:**
- Linux/Mac: `openssl rand -base64 32`
- Windows: Use https://www.random.org/strings/ (32 caracteres)

5. Clique em **Save**

### Passo 2: Verificar Banco de Dados

Você precisa de um banco MySQL na nuvem. Opções:

**Opção A: PlanetScale (Recomendado - Gratuito)**
1. Criar conta: https://planetscale.com
2. Criar database "sinais-app"
3. Copiar connection string
4. Colar em `DATABASE_URL` no Netlify

**Opção B: AWS RDS**
1. Criar instância MySQL
2. Copiar endpoint
3. Colar em `DATABASE_URL`

**Opção C: Servidor Local (Não recomendado para Netlify)**
- Netlify não consegue acessar seu computador
- Use PlanetScale ou AWS RDS

### Passo 3: Fazer Push do Código

```bash
# No seu computador
cd sinais-app

# Adicionar arquivo de configuração
git add netlify.toml NETLIFY_TROUBLESHOOTING.md NETLIFY_SETUP.md

# Fazer commit
git commit -m "Add Netlify configuration files"

# Fazer push
git push origin main
```

Netlify fará deploy automaticamente.

### Passo 4: Monitorar o Build

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

### Passo 5: Testar o Site

1. Acesse: https://frabjous-piroshki-525d65.netlify.app/
2. Você deve ver a página de login
3. Se vir 404, volte ao **Passo 4** e verifique o build log

---

## 📋 Checklist Completo

- [ ] Banco de dados criado (PlanetScale ou AWS RDS)
- [ ] `DATABASE_URL` adicionada em Environment
- [ ] `JWT_SECRET` adicionada em Environment
- [ ] `VITE_APP_TITLE` adicionada em Environment
- [ ] `VITE_APP_ID` adicionada em Environment
- [ ] `OWNER_NAME` adicionada em Environment
- [ ] `OWNER_OPEN_ID` adicionada em Environment
- [ ] `netlify.toml` adicionado ao repositório
- [ ] Código feito push para GitHub
- [ ] Build log mostra "Build complete"
- [ ] Site acessível em https://frabjous-piroshki-525d65.netlify.app/
- [ ] Página de login aparece (não 404)

---

## 🆘 Se Ainda Não Funcionar

### Opção 1: Limpar Cache e Redeployar

1. Em Netlify → **Deploys**
2. Clique em **Trigger deploy** → **Clear cache and retry**
3. Aguarde o novo build

### Opção 2: Resetar para Deploy Anterior

Se um deploy anterior funcionava:
1. Em Netlify → **Deploys**
2. Procure pelo deploy bem-sucedido
3. Clique nos 3 pontos → **Redeploy**

### Opção 3: Verificar Build Log Detalhado

1. Abra o build log completo
2. Procure por:
   - Primeira linha com erro (em vermelho)
   - Última linha antes de "Build failed"
3. Copie a mensagem de erro
4. Procure a solução em NETLIFY_TROUBLESHOOTING.md

### Opção 4: Contato

Se nenhuma solução funcionar:
- Envie print do build log
- Envie lista de variáveis de ambiente (sem valores sensíveis)
- Descreva os passos que fez

---

## 💡 Dicas Importantes

1. **Variáveis de Ambiente:** Sempre que adicionar/mudar, faça novo deploy
2. **Banco de Dados:** Certifique-se que está acessível da internet
3. **Build Command:** Não mude de `pnpm install && pnpm build`
4. **Publish Directory:** Não mude de `dist`
5. **Node Version:** Mantenha em 18.17.0 ou superior

---

## 📞 Suporte

- **Netlify Docs:** https://docs.netlify.com/
- **Netlify Support:** https://support.netlify.com/
- **Manus Support:** suporte@manus.im

---

**Versão:** 1.0.0  
**Última atualização:** Dezembro 2025

Boa sorte! 🚀
