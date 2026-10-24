const API_URL = "/transacoes";

function formatarMoeda(valor) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function renderizarMetricas(metricas) {
  document.getElementById("saldo-total").textContent = formatarMoeda(metricas.saldoTotal);
  document.getElementById("total-despesas").textContent = formatarMoeda(metricas.totalDespesas);
  document.getElementById("gasto-impulso").textContent = formatarMoeda(metricas.totalGastoImpulso);
}

function renderizarHistorico(historico) {
  const lista = document.getElementById("historico");
  lista.innerHTML = "";

  if (historico.length === 0) {
    const li = document.createElement("li");
    li.textContent = "Nenhuma transação cadastrada ainda.";
    lista.appendChild(li);
    return;
  }

  historico.forEach((t) => {
    const li = document.createElement("li");

    const info = document.createElement("div");
    const descricao = document.createElement("div");
    descricao.textContent = t.descricao;
    const detalhe = document.createElement("div");
    detalhe.textContent = t.categoria;
    detalhe.style.fontSize = "0.75rem";
    detalhe.style.color = "#52606d";
    info.appendChild(descricao);
    info.appendChild(detalhe);

    const valor = document.createElement("span");
    const sinal = t.tipo === "receita" ? "+ " : "- ";
    valor.textContent = sinal + formatarMoeda(t.valor);
    valor.className = t.tipo;

    const tagImpulso = document.createElement("span");
    tagImpulso.className = "tag-impulso";
    tagImpulso.textContent = "impulso";
    tagImpulso.style.display = t.tipo === "despesa" && !t.consumoConsciente ? "inline-block" : "none";

    li.appendChild(info);
    li.appendChild(valor);
    li.appendChild(tagImpulso);
    lista.appendChild(li);
  });
}

function carregarDados() {
  fetch(API_URL)
    .then((response) => response.json())
    .then((dados) => {
      renderizarMetricas(dados.metricas);
      renderizarHistorico(dados.historico);
    })
    .catch((error) => console.error("Erro ao carregar dados:", error));
}

document.getElementById("form-transacao").addEventListener("submit", (evento) => {
  evento.preventDefault();

  const tipo = document.querySelector('input[name="tipo"]:checked').value;
  const consumoConsciente = document.getElementById("consumo-consciente").checked;

  const transacao = {
    descricao: document.getElementById("descricao").value,
    valor: parseFloat(document.getElementById("valor").value),
    tipo: tipo,
    categoria: document.getElementById("categoria").value,
    consumoConsciente: consumoConsciente,
  };

  fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(transacao),
  })
    .then((response) => {
      if (!response.ok) throw new Error("Erro ao salvar");
      document.getElementById("form-transacao").reset();
      carregarDados();
    })
    .catch((error) => console.error("Erro ao salvar transação:", error));
});

carregarDados();
