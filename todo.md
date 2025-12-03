# Sinais App - TODO

## Funcionalidades Principais

- [x] Schema de banco de dados (tabelas: spreadsheets, signals)
- [x] Migracao de banco de dados (pnpm db:push)
- [x] Implementar tRPC procedure para upload de planilha Excel
- [x] Implementar parser de Excel para extrair dados (Numero, Data, Horario, ID)
- [x] Implementar tRPC procedure para listar sinais
- [x] Implementar tRPC procedure para deletar planilha e sinais
- [x] UI responsiva mobile-first para upload (drag-and-drop)
- [x] UI responsiva para exibicao de sinais (cards/tabela)
- [x] UI para remocao de planilha
- [x] Monitoramento em tempo real de sinais
- [x] Alertas 1 minuto antes do horario programado
- [x] Notificacoes visuais e sonoras
- [x] Countdown para proximo sinal
- [x] Testes unitarios (vitest) para parser de Excel

## Melhorias Implementadas

- [x] Historico de alertas disparados (tabela alertHistory)
- [x] Filtros avancados (multiplicador minimo)
- [x] Integracao com webhooks (WhatsApp, Telegram, Email, Custom)
- [x] Pagina de configuracoes para gerenciar preferencias
- [x] Pagina de historico de alertas
- [x] Backend para enviar notificacoes via webhooks
- [x] Testes unitarios para parser de Excel
- [x] Rotas e navegacao atualizadas

## Progresso

- [x] Projeto web full-stack inicializado (React + TypeScript + Express + tRPC)
- [x] Fase 2: Schema e banco de dados
- [x] Fase 3: Backend (upload, parser)
- [x] Fase 4: Frontend responsivo com monitoramento em tempo real
- [x] Fase 5: Historico, filtros e webhooks
- [ ] Fase 6: Testes finais e deploy

## Bugs Encontrados

- [x] Erro ao fazer upload: "Input not instance of Buffer" - corrigir validacao Zod
- [x] Erro 404 no Netlify - configurar netlify.toml e variaveis de ambiente

## Melhorias Solicitadas

- [x] Botao conectar/desconectar sinal para ativar/desativar monitoramento
- [x] Indicador "10x +++" no campo multiplicador quando valor >= 10
- [x] Ocultar planilha - nao permitir visualizar ou baixar arquivo

## Melhorias de UI

- [x] Remover agrupamento por data/hora - mostrar apenas lista de sinais
- [x] Simplificar exibicao - mostrar apenas Horario, ID e Multiplicador
- [x] Ocultar dados - nao mostrar lista de sinais, apenas proximo alerta

- [x] Adicionar "Possível 10x ++" no painel de proximo alerta quando multiplicador >= 10
