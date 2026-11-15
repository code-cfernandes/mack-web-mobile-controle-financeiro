const API_URL = "/transacoes";

// ---------- Navegação entre as telas (#dashboard e #nova) ----------

const telas = {
  dashboard: document.getElementById("tela-dashboard"),
  nova: document.getElementById("tela-formulario"),
};

function mostrarTela() {
  const atual = location.hash === "#nova" ? "nova" : "dashboard";

  Object.entries(telas).forEach(([nome, secao]) => {
    secao.hidden = nome !== atual;
  });
  document.querySelectorAll(".navegacao a").forEach((link) => {
    link.classList.toggle("ativo", link.dataset.tela === atual);
    link.setAttribute("aria-current", link.dataset.tela === atual ? "page" : "false");
  });

  // Ao voltar para o início, busca os dados mais recentes na API
  if (atual === "dashboard") carregarDados();
  else document.getElementById("descricao").focus();
}

window.addEventListener("hashchange", mostrarTela);

// ---------- Mensagens de retorno para o usuário ----------

let temporizadorMensagem;

function mostrarMensagem(texto, tipo) {
  const caixa = document.getElementById("mensagem");
  caixa.textContent = texto;
  caixa.className = "mensagem " + tipo; // "sucesso" ou "erro"
  caixa.hidden = false;
  clearTimeout(temporizadorMensagem);
  temporizadorMensagem = setTimeout(() => (caixa.hidden = true), 4000);
}

// ---------- Dashboard: só exibe o que a API já calculou ----------

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
    li.className = "vazio";
    li.textContent = "Nenhuma transação cadastrada ainda.";
    lista.appendChild(li);
    return;
  }

  historico.forEach((t) => {
    const li = document.createElement("li");

    const info = document.createElement("div");
    info.className = "info";
    const descricao = document.createElement("span");
    descricao.className = "descricao";
    descricao.textContent = t.descricao;
    const categoria = document.createElement("span");
    categoria.className = "categoria";
    categoria.textContent = t.categoria;
    info.append(descricao, categoria);

    const lado = document.createElement("div");
    lado.className = "lado";
    const valor = document.createElement("span");
    valor.className = "valor-item " + t.tipo;
    valor.textContent = (t.tipo === "receita" ? "+ " : "- ") + formatarMoeda(t.valor);
    lado.appendChild(valor);

    if (t.tipo === "despesa" && !t.consumoConsciente) {
      const tag = document.createElement("span");
      tag.className = "tag-impulso";
      tag.textContent = "impulso";
      lado.appendChild(tag);
    }

    li.append(info, lado);
    lista.appendChild(li);
  });
}

function carregarDados() {
  fetch(API_URL)
    .then((response) => {
      if (!response.ok) throw new Error("HTTP " + response.status);
      return response.json();
    })
    .then((dados) => {
      renderizarMetricas(dados.metricas);
      renderizarHistorico(dados.historico);
    })
    .catch((error) => {
      console.error("Erro ao carregar dados:", error);
      mostrarMensagem("Não foi possível carregar os dados. Verifique a conexão com o servidor.", "erro");
    });
}

// ---------- Formulário: envia a transação com POST ----------

const formulario = document.getElementById("form-transacao");
const grupoConsumo = document.getElementById("grupo-consumo");

// Receita não é gasto: a pergunta consciente/impulso só aparece para despesa
function atualizarGrupoConsumo() {
  const tipo = formulario.querySelector('input[name="tipo"]:checked').value;
  grupoConsumo.hidden = tipo === "receita";
}
formulario.querySelectorAll('input[name="tipo"]').forEach((radio) =>
  radio.addEventListener("change", atualizarGrupoConsumo),
);

formulario.addEventListener("submit", (evento) => {
  evento.preventDefault();

  if (!formulario.checkValidity()) {
    formulario.reportValidity();
    mostrarMensagem("Preencha descrição, um valor maior que zero e a categoria.", "erro");
    return;
  }

  const tipo = formulario.querySelector('input[name="tipo"]:checked').value;
  const consumo = formulario.querySelector('input[name="consumo"]:checked').value;

  const transacao = {
    descricao: document.getElementById("descricao").value.trim(),
    valor: parseFloat(document.getElementById("valor").value),
    tipo: tipo,
    categoria: document.getElementById("categoria").value.trim(),
    // Receita é sempre registrada como consciente (não entra no gasto por impulso)
    consumoConsciente: tipo === "receita" || consumo === "consciente",
  };

  const botao = document.getElementById("botao-salvar");
  botao.disabled = true;
  botao.textContent = "Salvando...";

  fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(transacao),
  })
    .then((response) => {
      if (!response.ok) throw new Error("HTTP " + response.status);
      formulario.reset();
      atualizarGrupoConsumo();
      mostrarMensagem("Transação salva com sucesso!", "sucesso");
      location.hash = "#dashboard"; // volta ao início, que recarrega os dados
    })
    .catch((error) => {
      console.error("Erro ao salvar transação:", error);
      mostrarMensagem("Erro ao salvar a transação. Tente novamente.", "erro");
    })
    .finally(() => {
      botao.disabled = false;
      botao.textContent = "Salvar";
    });
});

mostrarTela();
