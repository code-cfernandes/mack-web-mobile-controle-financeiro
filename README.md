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

## Front-end (Aula 8)

Páginas estáticas em `src/public` (HTML, CSS e JS puros), servidas pelo próprio NestJS (`app.useStaticAssets`), com design **mobile first**:

- **Duas telas** com barra de navegação inferior, no padrão de aplicativo de celular:
  - **Início** (`#dashboard`, tela inicial): faz `GET /transacoes` e exibe o objeto `metricas` (Saldo Total, Total de Despesas e **Total Gasto por Impulso em vermelho**, para reflexão sobre o consumo — ODS 12) e o array `historico` como extrato, com a etiqueta "impulso" nas despesas não essenciais.
  - **Nova transação** (`#nova`): formulário com descrição, valor, tipo (receita/despesa), categoria e consumo consciente ou por impulso (botões de rádio); ao salvar, faz `POST /transacoes` e volta ao início.
- **O JavaScript não faz cálculos**: só lê os valores prontos do JSON e os formata em reais.
- **Mensagens de retorno** na tela: confirmação ao salvar, aviso de campos inválidos e erro de conexão com o servidor. O botão fica desabilitado ("Salvando...") durante o envio.
- **Pergunta consciente/impulso só para despesas**: ao escolher "Receita", o grupo some, já que receita não é gasto.
- **Layout**: Grid nas métricas (uma coluna no celular, três a partir de 600 px) e Flexbox no extrato, no formulário e na navegação. Campos com fonte de 16 px (evita o zoom automático do iPhone) e áreas de toque de pelo menos 44 px.

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

Pré-requisitos: Node.js 20.12+ e um MongoDB (local ou MongoDB Atlas).

```bash
npm install
npm run start:dev
```

A URI do banco vem das variáveis `MONGODB_URI` ou `MONGO_URI` (os dois nomes são
aceitos), nesta ordem:

1. exportada no terminal: `export MONGO_URI="mongodb://localhost:27018/controle-financeiro"` (ou `export MONGODB_URI="..."`);
2. arquivo `.env` na raiz do projeto, com a linha `MONGO_URI="..."` ou `MONGODB_URI="..."` (carregado com `process.loadEnvFile`, recurso nativo do Node, sem dependência extra);
3. se nenhuma das duas existir, `mongodb://localhost:27017/controle-financeiro`.

Na inicialização, o log mostra a URI usada (com a senha mascarada) e de onde ela veio, e, quando tudo sobe, o endereço da aplicação:

```
[Inicializacao] MongoDB: mongodb+srv://usuario:****@cluster.mongodb.net (origem: arquivo .env)
[Inicializacao] Aplicação no ar: http://localhost:3000
```

### Problemas comuns na inicialização

- **MongoDB fora do ar ou URI errada**: a aplicação tenta conectar 2 vezes (até 5 s cada) e então **encerra com uma mensagem explicando a causa** (URI, origem e motivo, ex.: `ECONNREFUSED`) e como resolver. Ela não fica presa tentando para sempre.
- **Navegador mostra outra página em `localhost:3000`** (ex.: "Hello, World!"): é outro programa usando a porta. A aplicação só abre a porta depois de conectar ao banco; confira no terminal se apareceu `Aplicação no ar`.
- **Porta 3000 ocupada**: a aplicação avisa e encerra. Rode com outra porta: `PORT=3001 npm run start:dev`.

Acesse o front-end em `http://localhost:3000` (arquivos estáticos em `src/public`).

## Estrutura

```
src/
├── main.ts                  # bootstrap, mensagens de erro e src/public
├── app.module.ts            # conexão com o MongoDB (forRootAsync, falha rápida)
├── config/mongo.config.ts   # resolve a MONGO_URI/MONGODB_URI (terminal, .env ou padrão)
├── transacoes/              # módulo, controller, service, DTO e schema
└── public/                  # front-end (index.html, style.css, script.js)
```

## Autor

Caio Alberto Fernandes — RA 10728625
