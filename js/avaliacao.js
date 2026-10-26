(() => {
  "use strict";

  const metrics = {
    nps(promoters, neutrals, detractors) {
      const total = promoters + neutrals + detractors;
      return total === 0 ? null : ((promoters - detractors) / total) * 100;
    },
    ratio(part, total) {
      return total === 0 ? null : (part / total) * 100;
    },
    sessionsPerUser(sessions, activeUsers) {
      return activeUsers === 0 ? null : sessions / activeUsers;
    },
    growth(previous, current) {
      return previous === 0 ? null : ((current - previous) / previous) * 100;
    },
    average(total, count) {
      return count === 0 ? null : total / count;
    },
    churn(left, startingUsers) {
      return metrics.ratio(left, startingUsers);
    },
    conversion(part, total) {
      return metrics.ratio(part, total);
    },
    availability(available, observed) {
      return observed === 0 ? null : (available / observed) * 100;
    },
    startFunnelVisit(state, dateKey) {
      const dailyAcquisition = { ...state.dailyAcquisition };
      if (dateKey) dailyAcquisition[dateKey] = (dailyAcquisition[dateKey] || 0) + 1;
      return {
        version: state.version,
        counts: { ...state.counts, acquisition: state.counts.acquisition + 1 },
        journey: { activation: false, retention: false, revenue: false, recommendation: false },
        ratings: { ...state.ratings },
        dailyAcquisition
      };
    },
    engagementActions(counts) {
      return counts.activation + counts.retention + counts.revenue + counts.recommendation;
    },
    engagement(counts) {
      return counts.acquisition === 0 ? null : metrics.engagementActions(counts) / counts.acquisition;
    },
    acquisitionTrend(dailyAcquisition, dateKey) {
      const [year, month, day] = dateKey.split("-").map(Number);
      const previousDate = new Date(Date.UTC(year, month - 1, day - 1)).toISOString().slice(0, 10);
      const today = dailyAcquisition[dateKey] || 0;
      const yesterday = dailyAcquisition[previousDate] || 0;
      return { today, yesterday, growth: metrics.growth(yesterday, today), previousDate };
    },
    advanceFunnel(state, stage, { allowRecommendation = false } = {}) {
      const stages = ["activation", "retention", "revenue", "recommendation"];
      const index = stages.indexOf(stage);
      if (index < 0) throw new Error(`Etapa desconhecida: ${stage}`);
      if (state.journey[stage]) return state;
      if (index > 0 && !state.journey[stages[index - 1]]) {
        throw new Error("Conclua as etapas anteriores antes de avançar.");
      }
      if (stage === "recommendation" && !allowRecommendation) {
        throw new Error("Registre uma nota NPS para concluir a recomendação.");
      }
      return {
        version: state.version,
        counts: { ...state.counts, [stage]: state.counts[stage] + 1 },
        journey: { ...state.journey, [stage]: true },
        ratings: { ...state.ratings },
        dailyAcquisition: { ...state.dailyAcquisition }
      };
    },
    registerFunnelRating(state, score) {
      if (!Number.isInteger(score) || score < 0 || score > 10) {
        throw new Error("A nota NPS deve ser um número inteiro de 0 a 10.");
      }
      if (!state.journey.revenue) {
        throw new Error("Conclua as etapas anteriores antes de avaliar.");
      }
      if (state.journey.recommendation) return state;
      const group = score >= 9 ? "promoters" : score >= 7 ? "neutrals" : "detractors";
      const next = metrics.advanceFunnel(state, "recommendation", { allowRecommendation: true });
      return {
        ...next,
        counts: {
          ...next.counts,
          recommendation: state.counts.recommendation + (group === "promoters" ? 1 : 0)
        },
        ratings: {
          ...state.ratings,
          [group]: state.ratings[group] + 1
        }
      };
    },
    npsFromRatings(ratings) {
      return metrics.nps(ratings.promoters, ratings.neutrals, ratings.detractors);
    },
    funnelRates(counts) {
      return [
        { key: "activation", name: "Aquisição → Ativação", value: metrics.ratio(counts.activation, counts.acquisition) },
        { key: "retention", name: "Ativação → Retenção", value: metrics.ratio(counts.retention, counts.activation) },
        { key: "revenue", name: "Retenção → Receita", value: metrics.ratio(counts.revenue, counts.retention) },
        { key: "recommendation", name: "Receita → Recomendação", value: metrics.ratio(counts.recommendation, counts.revenue) }
      ];
    },
    largestFunnelDrop(rates) {
      if (rates.some((rate) => rate.value === null)) return [];
      const lowest = Math.min(...rates.map((rate) => rate.value));
      return rates.filter((rate) => Math.abs(rate.value - lowest) < 1e-9);
    },
    weakestFunnel(activation, retention, revenue) {
      const rates = [
        { name: "Aquisição → Ativação", value: activation },
        { name: "Ativação → Retenção", value: retention },
        { name: "Retenção → Receita", value: revenue }
      ];
      const min = Math.min(...rates.map((rate) => rate.value));
      return rates.filter((rate) => Math.abs(rate.value - min) < 1e-9).map((rate) => rate.name);
    }
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = metrics;
    return;
  }

  const form = document.querySelector(".evaluation-container");
  if (!form) return;

  const numberFormat = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 });
  const percentFormat = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 });
  const errorMessages = new Map();

  const funnelStorageKey = "clean-financy-aarrr";
  const funnelStages = ["activation", "retention", "revenue", "recommendation"];
  const funnelStageNames = {
    activation: "Ativação",
    retention: "Retenção",
    revenue: "Receita",
    recommendation: "Recomendação"
  };
  const emptyFunnel = () => ({
    version: 3,
    counts: { acquisition: 0, activation: 0, retention: 0, revenue: 0, recommendation: 0 },
    journey: { activation: false, retention: false, revenue: false, recommendation: false },
    ratings: { promoters: 0, neutrals: 0, detractors: 0 },
    dailyAcquisition: {}
  });
  function localDateKey(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  const funnelStatus = form.querySelector("[data-usage-status]");
  let usageFunnel = null;
  let funnelStorageReady = false;

  function isValidFunnel(value) {
    const countKeys = ["acquisition", ...funnelStages];
    return value &&
      value.version === 3 &&
      value.counts &&
      countKeys.every((key) => Number.isSafeInteger(value.counts[key]) && value.counts[key] >= 0) &&
      value.journey &&
      funnelStages.every((key) => typeof value.journey[key] === "boolean") &&
      value.ratings &&
      ["promoters", "neutrals", "detractors"].every((key) => Number.isSafeInteger(value.ratings[key]) && value.ratings[key] >= 0) &&
      value.counts.recommendation <= value.ratings.promoters &&
      value.dailyAcquisition &&
      Object.entries(value.dailyAcquisition).every(([date, count]) =>
        /^\d{4}-\d{2}-\d{2}$/.test(date) && Number.isSafeInteger(count) && count >= 0
      );
  }

  function migrateFunnel(value) {
    if (!value || typeof value !== "object") return value;
    if ((value.version === 1 || value.version === 2) && value.counts && value.journey) {
      return {
        version: 3,
        counts: { ...value.counts },
        journey: { ...value.journey },
        ratings: value.ratings || {
          promoters: value.counts.recommendation,
          neutrals: 0,
          detractors: 0
        },
        dailyAcquisition: {}
      };
    }
    if (value.version === 3 && !value.dailyAcquisition) {
      return { ...value, dailyAcquisition: {} };
    }
    return value;
  }

  function showFunnelStatus(message, isError = false) {
    if (!funnelStatus) return;
    funnelStatus.textContent = message;
    funnelStatus.classList.toggle("is-error", isError);
  }

  function saveFunnel(nextState) {
    try {
      window.localStorage.setItem(funnelStorageKey, JSON.stringify(nextState));
      usageFunnel = nextState;
      return true;
    } catch (error) {
      showFunnelStatus(`Não foi possível salvar no armazenamento deste navegador: ${error.message}`, true);
      return false;
    }
  }

  function renderUsageFunnel() {
    if (!usageFunnel) return;
    Object.entries(usageFunnel.counts).forEach(([key, count]) => {
      const element = form.querySelector(`[data-usage-count="${key}"]`);
      if (element) element.textContent = numberFormat.format(count);
    });

    const rates = metrics.funnelRates(usageFunnel.counts);
    rates.forEach((rate) => {
      const element = form.querySelector(`[data-usage-rate="${rate.key}"]`);
      const conversion = form.querySelector(`[data-usage-conversion="${rate.key}"]`);
      if (element) element.textContent = rate.value === null ? "—" : `${percentFormat.format(rate.value)}%`;
      if (conversion) conversion.classList.remove("is-largest-drop");
    });
    ["acquisition", "activation", "retention", "revenue", "recommendation"].forEach((key) => {
      form.querySelectorAll(`[data-growth-count="${key}"], [data-quality-count="${key}"]`).forEach((element) => {
        element.textContent = numberFormat.format(usageFunnel.counts[key]);
      });
    });
    const trend = metrics.acquisitionTrend(usageFunnel.dailyAcquisition, localDateKey());
    setResult("acquisitionsToday", trend.today);
    setResult("acquisitionsYesterday", trend.yesterday);
    setResult("acquisitionGrowth", trend.growth, (value) => `${percentFormat.format(value)}%`);
    setTextResult("acquisitionGrowthNote", trend.yesterday === 0
      ? "Sem aquisições registradas ontem; não há base para comparar."
      : "Variação calculada com aquisições de hoje e de ontem.");
    rates.forEach((rate) => {
      const target = form.querySelector(`[data-quality-rate="${rate.key}"]`);
      if (target) target.textContent = rate.value === null ? "—" : `${percentFormat.format(rate.value)}%`;
    });

    const largestDrop = metrics.largestFunnelDrop(rates);
    const dropSummary = form.querySelector("[data-usage-drop]");
    if (!largestDrop.length) {
      if (dropSummary) {
        dropSummary.textContent = "A maior queda será destacada quando todas as etapas tiverem dados.";
        dropSummary.classList.remove("is-largest-drop");
      }
    } else {
      largestDrop.forEach((rate) => {
        const conversion = form.querySelector(`[data-usage-conversion="${rate.key}"]`);
        if (conversion) conversion.classList.add("is-largest-drop");
      });
      const names = largestDrop.map((rate) => rate.name).join(" e ");
      const drop = 100 - largestDrop[0].value;
      if (dropSummary) {
        dropSummary.textContent = `Maior queda: ${names} (${percentFormat.format(drop)}%).`;
        dropSummary.classList.add("is-largest-drop");
      }
    }

    const activated = usageFunnel.journey.activation;
    const retained = usageFunnel.journey.retention;
    const paid = usageFunnel.journey.revenue;
    const prerequisites = {
      activation: true,
      retention: activated,
      revenue: retained,
      recommendation: paid
    };
    funnelStages.forEach((stage) => {
      const button = form.querySelector(`[data-usage-action="${stage}"]`);
      if (button) button.disabled = !prerequisites[stage] || usageFunnel.journey[stage];
    });
    updateAll();
  }

  function initializeUsageFunnel() {
    try {
      const raw = window.localStorage.getItem(funnelStorageKey);
      const stored = raw === null ? emptyFunnel() : migrateFunnel(JSON.parse(raw));
      if (!isValidFunnel(stored)) {
        throw new Error("Os dados salvos do funil estão inválidos. Remova a chave clean-financy-aarrr do armazenamento para reiniciar.");
      }
      const startedVisit = metrics.startFunnelVisit(stored, localDateKey());
      if (!saveFunnel(startedVisit)) return;
      funnelStorageReady = true;
      showFunnelStatus("Jornada iniciada. Os números agregados são guardados apenas neste navegador.");
      renderUsageFunnel();
    } catch (error) {
      showFunnelStatus(`Não foi possível carregar o funil salvo: ${error.message}`, true);
      form.querySelectorAll("[data-usage-action]").forEach((button) => { button.disabled = true; });
    }
  }

  form.querySelectorAll("[data-usage-action]").forEach((button) => {
    button.addEventListener("click", () => {
      if (!funnelStorageReady || !usageFunnel) return;
      const stage = button.dataset.usageAction;
      if (stage === "recommendation") {
        const scoreInput = form.querySelector("#usage-nps");
        const score = Number(scoreInput.value);
        if (!scoreInput.value) {
          showFunnelStatus("Escolha uma nota de 0 a 10 para continuar.", true);
          return;
        }
      }
      try {
        const score = stage === "recommendation" ? Number(form.querySelector("#usage-nps").value) : null;
        const nextState = stage === "recommendation"
          ? metrics.registerFunnelRating(usageFunnel, score)
          : metrics.advanceFunnel(usageFunnel, stage);
        if (nextState === usageFunnel) return;
        if (saveFunnel(nextState)) {
          renderUsageFunnel();
          showFunnelStatus(stage === "recommendation"
            ? score >= 9
              ? "Nota registrada. Ela entrou no NPS e na contagem de recomendação."
              : "Nota registrada no NPS. A recomendação conta somente notas 9 ou 10."
            : `Etapa de ${funnelStageNames[stage]} registrada.`);
        }
      } catch (error) {
        showFunnelStatus(`Não foi possível registrar a etapa: ${error.message}`, true);
      }
    });
  });

  initializeUsageFunnel();

  function setResult(name, value, formatter = (number) => numberFormat.format(number)) {
    const target = form.querySelector(`[data-result="${name}"]`);
    if (!target) return;
    target.textContent = value === null || !Number.isFinite(value) ? "—" : formatter(value);
  }

  function setTextResult(name, value) {
    const target = form.querySelector(`[data-result="${name}"]`);
    if (target) target.textContent = value || "—";
  }

  function setError(key, message = "") {
    const input = form.querySelector(`[data-field="${key}"]`);
    const target = form.querySelector(`[data-error="${key}"]`);
    if (target) target.textContent = message;
    if (input) {
      if (message) input.setAttribute("aria-invalid", "true");
      else input.removeAttribute("aria-invalid");
    }
    errorMessages.set(key, message);
  }

  function readNumber(key) {
    const input = form.querySelector(`[data-field="${key}"]`);
    if (!input) return null;
    const raw = input.value.trim();
    if (!raw) {
      setError(key);
      return null;
    }
    const value = Number(raw);
    if (!Number.isFinite(value)) {
      setError(key, "Informe um número válido.");
      return null;
    }
    if (value < 0) {
      setError(key, "Use um valor igual ou maior que zero.");
      return null;
    }
    if (input.dataset.kind === "count" && !Number.isInteger(value)) {
      setError(key, "Informe uma quantidade inteira.");
      return null;
    }
    setError(key);
    return value;
  }

  function readText(key) {
    const input = form.querySelector(`[data-field="${key}"]`);
    return input ? input.value.trim() : "";
  }

  function notGreater(partKey, totalKey, part, total) {
    if (part === null || total === null || part <= total) return true;
    setError(partKey, "Esse valor não pode ser maior que o total informado.");
    return false;
  }

  function setPercentage(name, value) {
    setResult(name, value, (number) => `${percentFormat.format(number)}%`);
  }

  function updateProduct() {
    const ratings = usageFunnel ? usageFunnel.ratings : { promoters: 0, neutrals: 0, detractors: 0 };
    const totalRatings = ratings.promoters + ratings.neutrals + ratings.detractors;
    const nps = totalRatings > 0 ? metrics.npsFromRatings(ratings) : null;
    const ratingCount = form.querySelector("[data-nps-count]");
    const promoterCount = form.querySelector("[data-nps-promoters]");
    const neutralCount = form.querySelector("[data-nps-neutrals]");
    const detractorCount = form.querySelector("[data-nps-detractors]");
    if (ratingCount) ratingCount.textContent = numberFormat.format(totalRatings);
    if (promoterCount) promoterCount.textContent = numberFormat.format(ratings.promoters);
    if (neutralCount) neutralCount.textContent = numberFormat.format(ratings.neutrals);
    if (detractorCount) detractorCount.textContent = numberFormat.format(ratings.detractors);
    setTextResult("npsMeaning", nps === null
      ? "Informe notas no funil AARRR para calcular."
      : nps > 50
        ? "Excelente."
        : nps >= 0
          ? "Bom, com espaço para melhorar."
          : "Mais insatisfeitos que satisfeitos.");
    setResult("nps", nps, (number) => numberFormat.format(number));

    const counts = usageFunnel ? usageFunnel.counts : { acquisition: 0, activation: 0, retention: 0, revenue: 0, recommendation: 0 };
    const engagementActions = metrics.engagementActions(counts);
    const productCounts = {
      acquisition: counts.acquisition,
      activation: counts.activation,
      retention: counts.retention,
      engagementActions
    };
    Object.entries(productCounts).forEach(([key, count]) => {
      const target = form.querySelector(`[data-product-count="${key}"]`);
      if (target) target.textContent = numberFormat.format(count);
    });
    const retention = metrics.ratio(counts.retention, counts.activation);
    setPercentage("retention", retention);
    setResult("engagement", metrics.engagement(counts));
  }

  function updateAll() {
    updateProduct();
  }

  function activateTab(tab, focus = false) {
    const tabs = [...form.querySelectorAll('[role="tab"]')];
    tabs.forEach((item) => {
      const selected = item === tab;
      item.setAttribute("aria-selected", String(selected));
      item.tabIndex = selected ? 0 : -1;
      const panel = form.querySelector(`#${item.getAttribute("aria-controls")}`);
      if (panel) panel.hidden = !selected;
    });
    if (focus) tab.focus();
  }

  const tabs = [...form.querySelectorAll('[role="tab"]')];
  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => activateTab(tab));
    tab.addEventListener("keydown", (event) => {
      let nextIndex = index;
      if (event.key === "ArrowRight") nextIndex = (index + 1) % tabs.length;
      else if (event.key === "ArrowLeft") nextIndex = (index - 1 + tabs.length) % tabs.length;
      else if (event.key === "Home") nextIndex = 0;
      else if (event.key === "End") nextIndex = tabs.length - 1;
      else return;
      event.preventDefault();
      activateTab(tabs[nextIndex], true);
    });
  });

  form.querySelectorAll("[data-field]").forEach((input) => {
    input.addEventListener("input", updateAll);
    input.addEventListener("change", updateAll);
  });

  function reportValue(input) {
    if (input.type === "number" && input.value !== "") {
      return input.dataset.kind === "count"
        ? numberFormat.format(Number(input.value))
        : numberFormat.format(Number(input.value));
    }
    return input.value.trim() || "Não informado";
  }

  function buildReport() {
    const lines = [
      "CLEAN-FINANCY — AVALIAÇÃO",
      `Período avaliado: ${readText("period") || "Não informado"}`,
      "Aviso: valores da avaliação informados manualmente. As notas NPS e etapas do funil são respostas agregadas salvas localmente.",
      "",
      "VALORES INFORMADOS"
    ];

    const fields = [...form.querySelectorAll("[data-field]")];
    fields.forEach((input) => {
      if (input.dataset.field === "period") return;
      lines.push(`${input.dataset.label || input.id}: ${reportValue(input)}`);
    });

    lines.push("", "RESULTADOS CALCULADOS");
    form.querySelectorAll("[data-result]").forEach((result) => {
      const value = result.textContent.trim();
      const label = result.parentElement.querySelector(":scope > span");
      if (!label) return;
      lines.push(`${label.textContent.trim()}: ${value}`);
    });

    if (usageFunnel) {
      lines.push("", "FUNIL AARRR INTERATIVO (CONTAGENS SALVAS NESTE NAVEGADOR)");
      Object.entries(usageFunnel.counts).forEach(([key, count]) => {
        lines.push(`${funnelStageNames[key] || "Aquisição"}: ${numberFormat.format(count)}`);
      });
      lines.push(
        `Total de notas NPS: ${numberFormat.format(usageFunnel.ratings.promoters + usageFunnel.ratings.neutrals + usageFunnel.ratings.detractors)}`,
        `Notas promotoras (9–10): ${numberFormat.format(usageFunnel.ratings.promoters)}`,
        `Notas neutras (7–8): ${numberFormat.format(usageFunnel.ratings.neutrals)}`,
        `Notas detratoras (0–6): ${numberFormat.format(usageFunnel.ratings.detractors)}`,
        `NPS calculado pelas notas: ${metrics.npsFromRatings(usageFunnel.ratings) === null ? "—" : numberFormat.format(metrics.npsFromRatings(usageFunnel.ratings))}`
      );
      metrics.funnelRates(usageFunnel.counts).forEach((rate) => {
        const value = rate.value === null ? "—" : `${percentFormat.format(rate.value)}%`;
        lines.push(`Conversão ${rate.name}: ${value}`);
      });
      const largestDrop = metrics.largestFunnelDrop(metrics.funnelRates(usageFunnel.counts));
      if (largestDrop.length) {
        lines.push(`Maior queda: ${largestDrop.map((rate) => rate.name).join(" e ")} (${percentFormat.format(100 - largestDrop[0].value)}%).`);
      } else {
        lines.push("Maior queda: ainda não disponível.");
      }
    }

    lines.push(
      "",
      "DOS NÚMEROS À DECISÃO",
      `Problema e evidência: ${readText("decisionProblem") || "Não informado"}`,
      `Ação e o que fica para depois: ${readText("decisionAction") || "Não informado"}`,
      `Responsável: ${readText("decisionOwner") || "Não informado"}`,
      `Data de revisão: ${readText("reviewDate") || "Não informado"}`
    );
    return lines.join("\r\n");
  }

  const downloadButton = form.querySelector("#download-evaluation");
  const downloadStatus = form.querySelector("#download-status");
  if (downloadButton) {
    downloadButton.addEventListener("click", () => {
      updateAll();
      const blob = new Blob(["\uFEFF", buildReport()], { type: "text/plain;charset=utf-8" });
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = "avaliacao-clean-financy.txt";
      link.hidden = true;
      document.body.append(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
      if (downloadStatus) downloadStatus.textContent = "Avaliação baixada no seu dispositivo.";
    });
  }

  updateAll();

  if (typeof window !== "undefined") window.CleanFinancyMetrics = metrics;
})();
