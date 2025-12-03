# 🔧 Troubleshooting - Deploy Netlify Falhou

## Seu Novo Projeto
- **URL:** https://snazzy-horse-624756.netlify.app/
- **Painel:** https://app.netlify.com/projects/snazzy-horse-624756/overview

---

## ⚠️ Como Verificar o Erro

1. Acesse: https://app.netlify.com/projects/snazzy-horse-624756/deploys
2. Clique no **último deploy** (topo da lista)
3. Clique em **"Build log"**
4. Procure por mensagens em **vermelho** ou "**Build failed**"
5. Copie a mensagem de erro

---

## 🔴 Erros Mais Comuns e Soluções

### Erro 1: `DATABASE_URL is not defined`

**Causa:** Variável de ambiente não foi adicionada

**Solução:**
1. Vá para: Settings → Build & deploy → Environment
2. Clique em **Edit variables**
3. Adicione:
   ```
   DATABASE_URL = mysql://usuario:senha@host:3306/banco
   ```
4. Clique em **Save**
5. Volte a Deploys e clique em **Trigger deploy** → **Clear cache and retry**

---

### Erro 2: `JWT_SECRET is not defined`

**Causa:** Variável de ambiente não foi adicionada

**Solução:**
1. Vá para: Settings → Build & deploy → Environment
2. Clique em **Edit variables**
3. Adicione:
   ```
   JWT_SECRET = (gere com: openssl rand -base64 32)
   ```
4. Clique em **Save**
5. Dispare novo deploy

---

### Erro 3: `Cannot find module 'xlsx'`

**Causa:** Dependência não foi instalada

**Solução:**
1. No seu computador, abra terminal
2. Navegue até a pasta do projeto:
   ```bash
   cd sinais-app
   ```
3. Instale a dependência:
   ```bash
   pnpm add xlsx
   ```
4. Faça commit e push:
   ```bash
   git add package.json pnpm-lock.yaml
   git commit -m "Add xlsx dependency"
   git push origin main
   ```
5. Netlify fará deploy automaticamente

---

### Erro 4: `Build timed out`

**Causa:** Banco de dados muito lento ou indisponível

**Solução:**
1. Verifique se o banco de dados está online
2. Teste a conexão:
   ```bash
   mysql -h seu_host -u usuario -p -e "SELECT 1"
   ```
3. Se usar PlanetScale, verifique se SSL está ativado
4. Aumente o timeout em `netlify.toml`:
   ```toml
   [build]
   command = "pnpm install && pnpm build"
   functions = "dist"
   publish = "dist"
   timeout = 900  # 15 minutos
   ```

---

### Erro 5: `Cannot read property 'DATABASE_URL' of undefined`

**Causa:** Arquivo `.env` não está sendo carregado

**Solução:**
1. Certifique-se que as variáveis estão em **Settings → Environment**, não em arquivo `.env`
2. Remova arquivo `.env` do repositório:
   ```bash
   git rm --cached .env
   echo ".env" >> .gitignore
   git add .gitignore
   git commit -m "Remove .env from git"
   git push origin main
   ```

---

### Erro 6: `Port 3000 is already in use`

**Causa:** Porta já está sendo usada

**Solução:**
1. Netlify usa porta 8888 por padrão, não 3000
2. Verifique `netlify.toml`:
   ```toml
   [build]
   command = "pnpm install && pnpm build"
   functions = "dist"
   publish = "dist"
   ```

---

### Erro 7: `EACCES: permission denied`

**Causa:** Permissões de arquivo incorretas

**Solução:**
1. No seu computador:
   ```bash
   chmod -R 755 sinais-app
   git add .
   git commit -m "Fix permissions"
   git push origin main
   ```

---

### Erro 8: `Error: ENOENT: no such file or directory`

**Causa:** Arquivo ou pasta não encontrada

**Solução:**
1. Verifique se todos os arquivos estão no repositório:
   ```bash
   git status
   git add .
   git commit -m "Add missing files"
   git push origin main
   ```

---

## 🟢 Verificar se Deploy Funcionou

Quando o build log mostrar:

```
✓ Build complete
✓ Deploy complete
```

Acesse: https://snazzy-horse-624756.netlify.app/

Você deve ver:
- ✅ Página de login (não 404)
- ✅ Logo 2x WIN - Sinais
- ✅ Campo de email e senha

---

## 📋 Checklist de Troubleshooting

- [ ] Variáveis de ambiente adicionadas (DATABASE_URL, JWT_SECRET, etc)
- [ ] Banco de dados está online e acessível
- [ ] Arquivo `netlify.toml` está no repositório
- [ ] Arquivo `.env` foi removido do repositório
- [ ] Todas as dependências estão em `package.json`
- [ ] Build log mostra "Build complete"
- [ ] Site acessível sem erro 404

---

## 🆘 Se Nada Funcionar

1. **Limpar cache e redeployar:**
   - Vá para Deploys
   - Clique em **Trigger deploy** → **Clear cache and retry**

2. **Resetar para deploy anterior:**
   - Se um deploy anterior funcionava
   - Clique nos 3 pontos → **Redeploy**

3. **Verificar logs detalhados:**
   - Build log completo
   - Procure pela primeira linha com erro (em vermelho)
   - Copie a mensagem de erro

4. **Contato:**
   - Netlify Support: https://support.netlify.com/
   - Envie screenshot do build log

---

## 💡 Dicas Importantes

1. **Variáveis de Ambiente:** Sempre que adicionar/mudar, faça novo deploy
2. **Banco de Dados:** Certifique-se que está acessível da internet
3. **Build Command:** Não mude de `pnpm install && pnpm build`
4. **Publish Directory:** Não mude de `dist`
5. **Node Version:** Mantenha em 18.17.0 ou superior

---

## 📞 Recursos Úteis

- **Netlify Docs:** https://docs.netlify.com/
- **Netlify Environment Variables:** https://docs.netlify.com/configure-builds/environment-variables/
- **Netlify Build Logs:** https://docs.netlify.com/monitor-sites/logs/
- **PlanetScale Docs:** https://planetscale.com/docs

---

**Versão:** 2.0.0  
**Última atualização:** Dezembro 2025

Boa sorte! 🚀
