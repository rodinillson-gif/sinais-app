# 🔧 Troubleshooting - Erro 404 no Netlify

## Problema: "Página não encontrada" (404)

Se você está vendo erro 404 ao acessar seu site no Netlify, siga estes passos:

---

## ✅ Passo 1: Verificar o Build Log

1. Acesse: https://app.netlify.com
2. Selecione seu site (`frabjous-piroshki-525d65`)
3. Clique em **Deploys**
4. Clique no deploy mais recente
5. Clique em **Build log** e procure por:
   - ❌ Erros em vermelho
   - ⚠️ Warnings em amarelo
   - ✅ "Build complete" no final

**Se o build falhou:**
- Procure pela mensagem de erro
- Comum: `DATABASE_URL not found`, `JWT_SECRET not found`
- Vá para **Passo 2**

---

## ✅ Passo 2: Configurar Variáveis de Ambiente

1. No Netlify, vá para: **Site settings** → **Build & deploy** → **Environment**
2. Clique em **Edit variables**
3. Adicione estas variáveis:

| Chave | Valor | Descrição |
|-------|-------|-----------|
| `DATABASE_URL` | `mysql://user:pass@host:3306/db` | Sua conexão MySQL |
| `JWT_SECRET` | `sua_chave_secreta_aqui` | Chave de 32+ caracteres |
| `VITE_APP_TITLE` | `2x WIN - Sinais` | Título da app |
| `VITE_APP_ID` | `seu_app_id` | ID da aplicação |
| `OWNER_NAME` | `Seu Nome` | Seu nome |
| `OWNER_OPEN_ID` | `seu_id` | ID único |

4. Clique em **Save**

---

## ✅ Passo 3: Fazer Novo Deploy

Após adicionar as variáveis, faça um novo deploy:

**Opção A: Via Git (Recomendado)**
```bash
# No seu computador
cd sinais-app
git add netlify.toml
git commit -m "Add Netlify configuration"
git push origin main
```

Netlify fará deploy automaticamente.

**Opção B: Trigger Manual**
1. Em Netlify → **Deploys**
2. Clique em **Trigger deploy** → **Deploy site**

---

## ✅ Passo 4: Verificar Build Log Novamente

Após o novo deploy:
1. Abra **Build log** do novo deploy
2. Procure por: `Build complete` ou `Deployed in`
3. Se vir ✅ sucesso, vá para **Passo 5**

---

## ✅ Passo 5: Testar o Site

1. Acesse: https://frabjous-piroshki-525d65.netlify.app/
2. Você deve ver a página de login
3. Se vir 404, continue para **Troubleshooting Avançado**

---

## 🔍 Troubleshooting Avançado

### Erro: "DATABASE_URL is not defined"

**Solução:**
1. Verifique se `DATABASE_URL` foi adicionada em Environment
2. Certifique-se de que a URL está correta:
   - Formato: `mysql://user:password@host:port/database`
   - Exemplo: `mysql://root:senha123@localhost:3306/sinais_app`
3. Se usar PlanetScale: copie a URL exata do dashboard deles
4. Faça novo deploy

### Erro: "Build failed"

**Solução:**
1. Verifique o build log completo
2. Procure por erros de TypeScript ou dependências
3. Tente localmente:
   ```bash
   pnpm install
   pnpm build
   ```
4. Se funcionar localmente, o problema é no Netlify

### Erro: "Cannot find module"

**Solução:**
1. Verifique se `pnpm-lock.yaml` foi feito push para Git
2. Verifique se `package.json` está correto
3. Tente:
   ```bash
   rm -rf node_modules pnpm-lock.yaml
   pnpm install
   git add .
   git commit -m "Update dependencies"
   git push
   ```

### Site mostra 404 em todas as páginas

**Solução:**
1. Verifique se `netlify.toml` foi adicionado ao projeto
2. Verifique se o arquivo `dist/index.html` foi gerado:
   ```bash
   pnpm build
   ls -la dist/
   ```
3. Se `dist/` está vazio, o build falhou

---

## 📋 Checklist de Deploy

- [ ] `DATABASE_URL` configurada em Environment
- [ ] `JWT_SECRET` configurada em Environment
- [ ] Todas as variáveis adicionadas em Environment
- [ ] `netlify.toml` adicionado ao projeto
- [ ] `pnpm-lock.yaml` feito push para Git
- [ ] Novo deploy disparado
- [ ] Build log mostra "Build complete"
- [ ] Site acessível em https://frabjous-piroshki-525d65.netlify.app/

---

## 🆘 Se Nada Funcionar

1. **Resetar o deploy:**
   - Vá para **Deploys** → clique nos 3 pontos do deploy anterior bem-sucedido → **Redeploy**

2. **Limpar cache:**
   - Vá para **Deploys** → **Trigger deploy** → **Clear cache and retry**

3. **Contatar Suporte:**
   - Netlify Support: https://support.netlify.com
   - Manus Support: suporte@manus.im

---

## 📞 Dúvidas?

Consulte:
- **INSTALACAO.md** - Guia completo de instalação
- **SETUP.md** - Configuração de variáveis
- **INICIO_RAPIDO.md** - Início rápido em 5 minutos

---

**Última atualização:** Dezembro 2025
