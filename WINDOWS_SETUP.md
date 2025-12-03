# 🪟 Guia Windows - Instalar e Fazer Build

## Seu Erro Atual

```
C:\WINDOWS\System32> pnpm install
pnpm : O termo 'pnpm' não é reconhecido...
```

**Problema:** Você está na pasta errada E `pnpm` não está instalado.

---

## ✅ Solução em 4 Passos

### Passo 1: Instalar Node.js (se não tiver)

1. Acesse: https://nodejs.org/
2. Baixe a versão **LTS** (recomendada)
3. Execute o instalador
4. Clique em **Next** até o final
5. Clique em **Install**

**Verificar se instalou:**
```powershell
node --version
npm --version
```

Você deve ver versões (ex: v18.17.0, 9.6.7)

---

### Passo 2: Instalar pnpm

Abra PowerShell **como Administrador** e execute:

```powershell
npm install -g pnpm
```

**Saída esperada:**
```
added 170 packages in 5s
```

**Verificar se instalou:**
```powershell
pnpm --version
```

Você deve ver uma versão (ex: 8.0.0)

---

### Passo 3: Extrair o ZIP

1. Baixe: `sinais-app-v2.0.0.zip`
2. Clique com botão direito → **Extrair tudo**
3. Escolha pasta de destino (ex: `C:\Users\rodin\Downloads`)
4. Clique em **Extrair**

Você terá uma pasta: `C:\Users\rodin\Downloads\sinais-app-v2.0.0`

---

### Passo 4: Abrir PowerShell na Pasta Correta

**Opção A (Mais Fácil):**
1. Abra a pasta `sinais-app-v2.0.0` no Windows Explorer
2. Clique na barra de endereço (onde mostra o caminho)
3. Digite: `powershell`
4. Pressione **Enter**

PowerShell abrirá **na pasta correta** automaticamente.

**Opção B (Manual):**
1. Abra PowerShell
2. Execute:
   ```powershell
   cd C:\Users\rodin\Downloads\sinais-app-v2.0.0
   ```

---

### Passo 5: Instalar Dependências

Execute:

```powershell
pnpm install
```

**Saída esperada:**
```
✓ Packages installed successfully
✓ 500+ packages installed
```

Isso pode levar **2-3 minutos**.

---

### Passo 6: Fazer Build

Execute:

```powershell
pnpm build
```

**Saída esperada:**
```
✓ Build complete
✓ dist/ folder created
✓ 150+ files generated
```

Isso pode levar **1-2 minutos**.

---

### Passo 7: Verificar Pasta `dist`

Na pasta `sinais-app-v2.0.0`, você deve ter uma pasta `dist`:

```
C:\Users\rodin\Downloads\sinais-app-v2.0.0\
├── dist\                    ← PASTA GERADA
│   ├── index.html
│   ├── assets\
│   └── ...
├── client\
├── server\
└── ...
```

---

### Passo 8: Upload no Netlify

1. Acesse: https://app.netlify.com/drop
2. Arraste a **pasta `dist`** para a página
3. Pronto! Deploy realizado

---

## 🆘 Troubleshooting Windows

### Erro: "pnpm : O termo 'pnpm' não é reconhecido"

**Solução:**
1. Abra PowerShell **como Administrador**
2. Execute:
   ```powershell
   npm install -g pnpm
   ```
3. Feche e reabra PowerShell
4. Tente novamente

### Erro: "Caminho não encontrado"

**Solução:**
1. Verifique se extraiu o ZIP corretamente
2. Verifique se está na pasta certa:
   ```powershell
   cd C:\Users\rodin\Downloads\sinais-app-v2.0.0
   dir
   ```
   Você deve ver: `client`, `server`, `package.json`, etc.

### Erro: "Cannot find module"

**Solução:**
```powershell
pnpm install
```

### Pasta `dist` não foi criada

**Solução:**
1. Verifique se `pnpm build` completou sem erros
2. Tente novamente:
   ```powershell
   pnpm install
   pnpm build
   ```

### PowerShell não abre na pasta

**Solução alternativa:**
1. Abra PowerShell normalmente
2. Execute:
   ```powershell
   cd C:\Users\rodin\Downloads\sinais-app-v2.0.0
   ```
3. Depois execute os comandos

---

## 📋 Checklist Completo

- [ ] Node.js instalado (`node --version` funciona)
- [ ] pnpm instalado (`pnpm --version` funciona)
- [ ] ZIP extraído em `C:\Users\rodin\Downloads\sinais-app-v2.0.0`
- [ ] PowerShell aberto na pasta correta
- [ ] `pnpm install` executado com sucesso
- [ ] `pnpm build` executado com sucesso
- [ ] Pasta `dist` criada
- [ ] Arquivo `dist\index.html` existe
- [ ] Pronto para upload no Netlify

---

## 💡 Dicas Windows

1. **Sempre abra PowerShell como Administrador** para instalar pacotes globais
2. **Feche e reabra PowerShell** após instalar pnpm
3. **Use a barra de endereço** do Explorer para abrir PowerShell na pasta certa
4. **Não use Command Prompt (cmd)**, use PowerShell
5. **Espaço em disco:** Precisa de ~1GB livre

---

## 🎯 Resumo Rápido

```powershell
# 1. Instalar Node.js (se não tiver)
# Baixe em: https://nodejs.org/

# 2. Instalar pnpm
npm install -g pnpm

# 3. Ir para a pasta
cd C:\Users\rodin\Downloads\sinais-app-v2.0.0

# 4. Instalar dependências
pnpm install

# 5. Fazer build
pnpm build

# 6. Pronto! Pasta dist criada
# 7. Upload em: https://app.netlify.com/drop
```

---

**Versão:** 2.0.0  
**Última atualização:** Dezembro 2025

Boa sorte! 🚀
