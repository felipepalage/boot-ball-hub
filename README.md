# Boot Ball Hub

Frontend oficial do Boleiroffice em Vite + React, integrado com a API ASP.NET Core do monorepo.

## Ambiente

Crie um arquivo `.env.local` com as variáveis abaixo quando a API não estiver no mesmo host:

```env
VITE_API_URL=https://api.seudominio.com/api
VITE_API_PROXY_TARGET=http://localhost:5005
```

- `VITE_API_URL`: URL usada pelo navegador em desenvolvimento e produção. Se não for definida, o frontend usa `/api`.
- `VITE_API_PROXY_TARGET`: alvo do proxy do Vite durante o desenvolvimento local.

## Comandos

```bash
npm install
npm run dev
npm run build
npm run preview
```

## Fluxos cobertos

- autenticação real com JWT
- cadastro vinculado à empresa
- listagem de desafios abertos com filtros
- aceite de desafio por um time da empresa autenticada
- proposta de resultado e confirmação pela outra equipe
- feed de jogos finalizados
- ranking com paginação
