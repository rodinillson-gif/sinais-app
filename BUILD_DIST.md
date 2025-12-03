# 🔨 Como Gerar a Pasta `dist`

A pasta `dist` contém o código compilado pronto para upload no Netlify. Ela é gerada automaticamente durante o build.

---

## ⚠️ Por que a pasta `dist` não está no ZIP?

A pasta `dist` é **gerada automaticamente** durante o build, então não precisa estar no ZIP. Você precisa gerá-la no seu computador.

---

## 🚀 Gerar a Pasta `dist` em 3 Passos

### Passo 1: Extrair o ZIP

1. Baixe: `sinais-app-v2.0.0.zip`
2. Extraia em uma pasta (ex: `C:\Users\Seu_Usuario\sinais-app`)

### Passo 2: Instalar Dependências

Abra terminal/PowerShell **na pasta do projeto** e execute:

**Windows (PowerShell):**
```powershell
cd C:\Users\Seu_Usuario\sinais-app
pnpm install
```

**Mac/Linux:**
```bash
cd ~/sinais-app
pnpm install
```

**Saída esperada:**
```
✓ Packages installed successfully
✓ 500+ packages installed
```

### Passo 3: Fazer Build

Execute:

```bash
pnpm build
```

**Saída esperada:**
```
✓ Build complete
✓ dist/ folder created
✓ 150+ files generated
```

---

## ✅ Verificar se Funcionou

Procure pela pasta `dist` dentro de `sinais-app`:

```
sinais-app/
├── dist/                    ← PASTA GERADA
│   ├── index.html
│   ├── assets/
│   └── ...
├── client/
├── server/
└── ...
```

Se a pasta `dist` existe, você está pronto para upload!

---

## 📤 Upload no Netlify

Agora você pode fazer upload:

### Opção A: Netlify Drop (Mais Fácil)

1. Acesse: https://app.netlify.com/drop
2. Arraste a **pasta `dist`** para a página
3. Pronto!

### Opção B: Netlify CLI

```bash
netlify deploy --prod --dir=dist
```

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
pnpm install
```

### Erro: "Build failed"

**Solução:**
1. Verifique se você está na pasta correta
2. Certifique-se que tem espaço em disco (mínimo 1GB)
3. Tente novamente:
   ```bash
   pnpm install
   pnpm build
   ```

### Pasta `dist` não foi criada

**Solução:**
1. Verifique o output do comando `pnpm build`
2. Procure por mensagens de erro em vermelho
3. Tente limpar cache:
   ```bash
   pnpm install
   rm -rf dist
   pnpm build
   ```

---

## 💡 Dicas

- **Tempo esperado:** 2-3 minutos para instalar + 1-2 minutos para build = ~5 minutos total
- **Espaço em disco:** Precisa de ~1GB livre
- **Internet:** Precisa de conexão para baixar dependências
- **Node.js:** Certifique-se que tem Node.js 18+ instalado

---

## 📋 Checklist

- [ ] ZIP extraído
- [ ] Terminal aberto na pasta `sinais-app`
- [ ] `pnpm install` executado com sucesso
- [ ] `pnpm build` executado com sucesso
- [ ] Pasta `dist` criada
- [ ] Arquivo `dist/index.html` existe
- [ ] Pronto para upload no Netlify

---

**Versão:** 2.0.0  
**Última atualização:** Dezembro 2025

Boa sorte! 🚀
