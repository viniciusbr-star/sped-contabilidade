// ============ CONFIGURAÇÃO ============
// Para trocar o número de WhatsApp do site inteiro, edite apenas a linha abaixo.
// Formato: código do país (55) + DDD + número, somente dígitos.
const WHATSAPP_NUMBER = "5518991080880";
const DEFAULT_MESSAGE = "Olá! Vim pelo site e gostaria de falar com a SPED Contabilidade.";

// Depoimentos: cole aqui o link publicado (Arquivo > Compartilhar > Publicar na web > CSV)
// da planilha de respostas do Google Form. Enquanto estiver vazio, a seção mostra a
// mensagem padrão de "ainda não há depoimentos". Veja o passo a passo no README.
const DEPOIMENTOS_SHEET_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRj9nrTVLAZ7rjV6B8DhrxBD08SmGthwEeMppS8tMd4VoeeR7EAJik6lAKe3eOGZ9KL6YzZS8OwNkhn/pub?output=csv";

// Endpoint de envio do Google Form (troque "viewform" por "formResponse" na URL do form)
// e os "entry.XXXXXXXXX" de cada campo. O formulário do site envia direto pra cá,
// sem exibir nada do Google pro visitante.
const GOOGLE_FORM_ACTION_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSe4Pcyn9GQV6XsCz9sr_gjtkkSTiD9uR3XDdiGe6SYRU_JN7w/formResponse";
const GOOGLE_FORM_ENTRY_DEPOIMENTO = "entry.310181082";
const GOOGLE_FORM_ENTRY_NOME = "entry.319481392";

// ============ Botões de WhatsApp ============
document.querySelectorAll("[data-whatsapp-btn]").forEach((btn) => {
  const message = btn.getAttribute("data-message") || DEFAULT_MESSAGE;
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  btn.setAttribute("href", url);
  btn.setAttribute("target", "_blank");
  btn.setAttribute("rel", "noopener noreferrer");
});

// ============ Menu mobile ============
const navToggle = document.getElementById("nav-toggle");
const mainNav = document.getElementById("main-nav");

if (navToggle && mainNav) {
  navToggle.addEventListener("click", () => {
    const isOpen = mainNav.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  mainNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      mainNav.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });
}

// ============ Ano no rodapé ============
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ============ Formulário de depoimento (envia direto pro Google Form) ============
const depoimentoForm = document.getElementById("depoimento-form");

if (depoimentoForm) {
  depoimentoForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const nome = document.getElementById("depoimento-nome").value.trim();
    const texto = document.getElementById("depoimento-texto").value.trim();
    if (!nome || !texto) return;

    const dados = new FormData();
    dados.append(GOOGLE_FORM_ENTRY_NOME, nome);
    dados.append(GOOGLE_FORM_ENTRY_DEPOIMENTO, texto);

    // mode "no-cors" é necessário porque o Google Forms não libera CORS para leitura da
    // resposta — o envio funciona normalmente, só não dá pra confirmar o status via JS.
    fetch(GOOGLE_FORM_ACTION_URL, { method: "POST", mode: "no-cors", body: dados }).finally(() => {
      depoimentoForm.reset();
      const status = document.getElementById("depoimento-form-status");
      if (status) status.hidden = false;
    });
  });
}

// ============ Depoimentos (buscados de uma planilha Google) ============
const depoimentosGrid = document.getElementById("depoimentos-grid");

function parseCSV(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else { inQuotes = false; }
      } else {
        field += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

if (depoimentosGrid && DEPOIMENTOS_SHEET_CSV_URL) {
  fetch(DEPOIMENTOS_SHEET_CSV_URL)
    .then((res) => res.text())
    .then((csvText) => {
      const linhas = parseCSV(csvText);
      const cabecalho = linhas[0] || [];
      // Busca as colunas pelo texto do cabeçalho (em vez de posição fixa), porque o Google
      // Forms só cria a coluna "nome" na planilha após a primeira resposta que a preenche.
      const indiceNome = cabecalho.findIndex((h) => /nome/i.test(h));
      const indiceTexto = cabecalho.findIndex((h) => /feedback|depoimento/i.test(h));

      const depoimentos = linhas
        .slice(1)
        .map((linha) => ({
          nome: indiceNome >= 0 ? (linha[indiceNome] || "").trim() : "",
          texto: indiceTexto >= 0 ? (linha[indiceTexto] || "").trim() : "",
        }))
        .filter((d) => d.texto)
        .reverse()
        .slice(0, 30);

      if (depoimentos.length === 0) return;

      const VISIVEIS_DE_INICIO = 6;

      depoimentosGrid.innerHTML = "";
      depoimentos.forEach((d, indice) => {
        const card = document.createElement("article");
        card.className = "depoimento-card";
        if (indice >= VISIVEIS_DE_INICIO) card.hidden = true;

        const quote = document.createElement("p");
        quote.className = "depoimento-quote";
        quote.textContent = `“${d.texto}”`;

        const autor = document.createElement("p");
        autor.className = "depoimento-autor";
        autor.textContent = d.nome || "Cliente SPED Contabilidade";

        card.appendChild(autor);
        card.appendChild(quote);
        depoimentosGrid.appendChild(card);
      });

      const verMaisBtn = document.getElementById("depoimentos-ver-mais");
      if (verMaisBtn && depoimentos.length > VISIVEIS_DE_INICIO) {
        verMaisBtn.hidden = false;
        let expandido = false;

        verMaisBtn.addEventListener("click", () => {
          expandido = !expandido;

          const cardsExtras = Array.from(depoimentosGrid.children).slice(VISIVEIS_DE_INICIO);
          cardsExtras.forEach((card) => { card.hidden = !expandido; });

          verMaisBtn.textContent = expandido ? "Ver menos depoimentos ↑" : "Ver mais depoimentos →";

          if (!expandido) {
            depoimentosGrid.scrollIntoView({ behavior: "smooth", block: "nearest" });
          }
        });
      }
    })
    .catch(() => {
      // Mantém a mensagem padrão de "ainda não há depoimentos" em caso de erro.
    });
}

// ============ Carrossel (galeria de fotos) ============
const carrosselTrack = document.getElementById("carrossel-track");

if (carrosselTrack) {
  const slides = carrosselTrack.children;
  const dots = document.querySelectorAll(".carrossel-dot");
  const prevBtn = document.getElementById("carrossel-prev");
  const nextBtn = document.getElementById("carrossel-next");
  let current = 0;
  let autoplayTimer;

  const irPara = (index) => {
    current = (index + slides.length) % slides.length;
    carrosselTrack.style.transform = `translateX(-${current * 100}%)`;
    dots.forEach((dot, i) => dot.classList.toggle("active", i === current));
  };

  const iniciarAutoplay = () => {
    autoplayTimer = setInterval(() => irPara(current + 1), 4500);
  };
  const pausarAutoplay = () => clearInterval(autoplayTimer);
  const reiniciarAutoplay = () => {
    pausarAutoplay();
    iniciarAutoplay();
  };

  prevBtn.addEventListener("click", () => { irPara(current - 1); reiniciarAutoplay(); });
  nextBtn.addEventListener("click", () => { irPara(current + 1); reiniciarAutoplay(); });
  dots.forEach((dot) => {
    dot.addEventListener("click", () => { irPara(Number(dot.dataset.index)); reiniciarAutoplay(); });
  });

  const carrossel = document.getElementById("carrossel");
  carrossel.addEventListener("mouseenter", pausarAutoplay);
  carrossel.addEventListener("mouseleave", iniciarAutoplay);

  iniciarAutoplay();
}

// ============ Calculadora de Economia Tributária ============
// Tabelas oficiais do Simples Nacional (Anexos I a V, LC 155/2016).
const SIMPLES_TABELAS = {
  comercio: [
    { limite: 180000, aliquota: 0.04, deduzir: 0 },
    { limite: 360000, aliquota: 0.073, deduzir: 5940 },
    { limite: 720000, aliquota: 0.095, deduzir: 13860 },
    { limite: 1800000, aliquota: 0.107, deduzir: 22500 },
    { limite: 3600000, aliquota: 0.143, deduzir: 87300 },
    { limite: 4800000, aliquota: 0.19, deduzir: 378000 },
  ],
  industria: [
    { limite: 180000, aliquota: 0.045, deduzir: 0 },
    { limite: 360000, aliquota: 0.078, deduzir: 5940 },
    { limite: 720000, aliquota: 0.10, deduzir: 13860 },
    { limite: 1800000, aliquota: 0.112, deduzir: 22500 },
    { limite: 3600000, aliquota: 0.147, deduzir: 85500 },
    { limite: 4800000, aliquota: 0.30, deduzir: 720000 },
  ],
  "servicos-gerais": [
    { limite: 180000, aliquota: 0.06, deduzir: 0 },
    { limite: 360000, aliquota: 0.112, deduzir: 9360 },
    { limite: 720000, aliquota: 0.135, deduzir: 17640 },
    { limite: 1800000, aliquota: 0.16, deduzir: 35640 },
    { limite: 3600000, aliquota: 0.21, deduzir: 125640 },
    { limite: 4800000, aliquota: 0.33, deduzir: 648000 },
  ],
  "servicos-intelectuais": [
    { limite: 180000, aliquota: 0.155, deduzir: 0 },
    { limite: 360000, aliquota: 0.18, deduzir: 4500 },
    { limite: 720000, aliquota: 0.195, deduzir: 9900 },
    { limite: 1800000, aliquota: 0.205, deduzir: 17100 },
    { limite: 3600000, aliquota: 0.23, deduzir: 62100 },
    { limite: 4800000, aliquota: 0.305, deduzir: 540000 },
  ],
};

const SIMULADOR_SEGMENTO_LABEL = {
  comercio: "Comércio",
  industria: "Indústria",
  "servicos-gerais": "Serviços gerais",
  "servicos-intelectuais": "Serviços intelectuais",
};

const simuladorForm = document.getElementById("simulador-form");

if (simuladorForm) {
  const formatarMoeda = (valor) =>
    valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  simuladorForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const faturamentoMensal = Number(document.getElementById("sim-faturamento").value);
    const segmento = document.getElementById("sim-segmento").value;
    if (!(faturamentoMensal > 0) || !segmento) return;

    const faturamentoAnual = faturamentoMensal * 12;
    const resultBox = document.getElementById("simulador-result");
    const warningEl = document.getElementById("sim-warning");
    const waBtn = document.getElementById("sim-whatsapp-btn");

    if (faturamentoAnual > 4800000) {
      warningEl.textContent =
        "Faturamento acima do limite do Simples Nacional (R$ 4,8 milhões/ano). Sua empresa provavelmente se enquadra em Lucro Presumido ou Lucro Real — fale com a gente para uma análise personalizada.";
      warningEl.hidden = false;
      document.getElementById("sim-out-anual").textContent = formatarMoeda(faturamentoAnual);
      document.getElementById("sim-out-aliquota").textContent = "—";
      document.getElementById("sim-out-imposto").textContent = "—";
      document.getElementById("sim-out-economia").textContent = "—";
    } else {
      warningEl.hidden = true;
      const tabela = SIMPLES_TABELAS[segmento];
      const faixa = tabela.find((f) => faturamentoAnual <= f.limite) || tabela[tabela.length - 1];
      const aliquotaEfetiva = Math.max(
        0,
        (faturamentoAnual * faixa.aliquota - faixa.deduzir) / faturamentoAnual
      );
      const impostoMensal = aliquotaEfetiva * faturamentoMensal;
      const economiaMin = impostoMensal * 0.10;
      const economiaMax = impostoMensal * 0.25;

      document.getElementById("sim-out-anual").textContent = formatarMoeda(faturamentoAnual);
      document.getElementById("sim-out-aliquota").textContent = `${(aliquotaEfetiva * 100).toFixed(2)}%`;
      document.getElementById("sim-out-imposto").textContent = `${formatarMoeda(impostoMensal)} / mês`;
      document.getElementById("sim-out-economia").textContent =
        `${formatarMoeda(economiaMin)} a ${formatarMoeda(economiaMax)} / mês`;
    }

    if (waBtn) {
      const mensagem =
        `Olá! Simulei no site da SPED Contabilidade: faturamento médio de ${formatarMoeda(faturamentoMensal)}/mês, ` +
        `segmento ${SIMULADOR_SEGMENTO_LABEL[segmento]}, e gostaria de uma análise real de economia tributária para minha empresa.`;
      waBtn.setAttribute("href", `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(mensagem)}`);
      waBtn.setAttribute("target", "_blank");
      waBtn.setAttribute("rel", "noopener noreferrer");
    }

    resultBox.hidden = false;
    resultBox.scrollIntoView({ behavior: "smooth", block: "nearest" });
  });
}
