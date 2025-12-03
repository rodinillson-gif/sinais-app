Guia de Deploy no Vercel

O Vercel é uma plataforma de hospedagem gratuita e muito fácil de usar. Siga este guia para publicar seu aplicativo!

Pré-requisitos

•
Conta GitHub (gratuita)

•
Conta Vercel (gratuita)

Passo 1: Criar Repositório no GitHub

1.
Acesse: https://github.com/new

2.
Nome do repositório: sinais-app

3.
Descrição: 2x WIN - Gerador de Sinais

4.
Selecione: Public (para Vercel acessar )

5.
Clique em Create repository

Passo 2: Fazer Push do Código para GitHub

No seu computador, abra PowerShell na pasta sinais-app:

Plain Text


git init
git add .
git commit -m "Initial commit - 2x WIN Sinais v1.0.0"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/sinais-app.git
git push -u origin main


Substitua SEU_USUARIO pelo seu usuário do GitHub!

Passo 3: Conectar Vercel ao GitHub

1.
Acesse: https://vercel.com/new

2.
Clique em Import Git Repository

3.
Cole a URL do seu repositório: https://github.com/SEU_USUARIO/sinais-app.git

4.
Clique em Import

Passo 4: Configurar Build

O Vercel detectará automaticamente que é um projeto Vite. Deixe as configurações padrão:

•
Framework Preset: Vite

•
Build Command: pnpm build

•
Output Directory: dist

Clique em Deploy

Passo 5: Aguardar Deploy

Aguarde 2-3 minutos. Quando terminar, você verá:

Plain Text


✓ Production
https://seu-projeto.vercel.app


Pronto! 🎉

Seu aplicativo está online! Acesse o link e comece a usar.

Atualizar o Código

Sempre que fizer mudanças:

Plain Text


git add .
git commit -m "Sua mensagem"
git push origin main


O Vercel fará deploy automaticamente!

Troubleshooting

Erro: "Build failed"

1.
Verifique se package.json existe

2.
Verifique se pnpm-lock.yaml existe

3.
Tente fazer build localmente: pnpm build

Erro: "404 Not Found"

1.
Verifique se dist/index.html existe

2.
Verifique se o build foi bem-sucedido

Erro: "Cannot find module"

1.
Execute: pnpm install

2.
Faça push novamente

Suporte

Para mais informações, visite: https://vercel.com/docs

