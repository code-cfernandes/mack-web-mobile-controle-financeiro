# Controle Financeiro Pessoal

API REST em **NestJS + MongoDB** com front-end mobile first para registrar receitas e despesas e acompanhar a saúde financeira do dia a dia.

Projeto extensionista da disciplina **Web Mobile** (TADS — Universidade Presbiteriana Mackenzie), pensado como ferramenta de apoio em oficinas comunitárias de letramento financeiro, alinhado aos ODS:

- **ODS 1** — Erradicação da pobreza: controle do orçamento familiar e prevenção do superendividamento;
- **ODS 12** — Consumo e produção responsáveis: cada despesa é marcada como essencial (consumo consciente) ou por impulso.

## Funcionalidades

- Cadastro de receitas e despesas com descrição, valor, tipo, categoria e consumo consciente.
- Dashboard com saldo total, total de despesas e **total gasto por impulso** (em destaque).
- Extrato com os lançamentos mais recentes.
- As métricas são calculadas no back-end; o front-end apenas exibe os dados recebidos.

## Endpoints

| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/transacoes` | Cadastra uma receita ou despesa |
| `GET` | `/transacoes` | Retorna `historico` (transações) e `metricas` (`saldoTotal`, `totalDespesas`, `totalGastoImpulso`) |

Exemplo de corpo do `POST`:

```json
{
  "descricao": "Conta de Luz",
  "valor": 180.5,
  "tipo": "despesa",
  "categoria": "Moradia",
  "consumoConsciente": true
}
```

## Como executar

Pré-requisitos: Node.js 20+ e um MongoDB (local ou MongoDB Atlas).

```bash
npm install

# MongoDB local (porta padrão) ou informe a URI do Atlas
export MONGODB_URI="mongodb://localhost:27017/controle-financeiro"

npm run start:dev
```

Acesse o front-end em `http://localhost:3000` (arquivos estáticos em `src/public`).

## Estrutura

```
src/
├── main.ts                  # bootstrap + arquivos estáticos de src/public
├── app.module.ts            # conexão com o MongoDB
├── transacoes/              # módulo, controller, service, DTO e schema
└── public/                  # front-end (index.html, style.css, script.js)
```

## Autor

Caio Alberto Fernandes — RA 10728625
