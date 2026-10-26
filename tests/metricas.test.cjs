"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const metrics = require("../js/avaliacao.js");

test("calcula NPS com promotores, neutros e detratores", () => {
  assert.equal(metrics.nps(11, 5, 4), 35);
});

test("NPS varia de -100 a 100 e não calcula com total zero", () => {
  assert.equal(metrics.nps(7, 0, 0), 100);
  assert.equal(metrics.nps(0, 0, 9), -100);
  assert.equal(metrics.nps(0, 0, 0), null);
});

test("calcula retenção", () => {
  assert.ok(Math.abs(metrics.ratio(38, 120) - 31.6666666667) < 1e-8);
});

test("calcula churn e retenção complementar", () => {
  const churn = metrics.churn(36, 240);
  assert.equal(churn, 15);
  assert.equal(100 - churn, 85);
});

test("calcula crescimento da base", () => {
  assert.equal(metrics.growth(240, 288), 20);
  assert.equal(metrics.growth(0, 288), null);
});

test("calcula conversão", () => {
  assert.equal(metrics.conversion(180, 500), 36);
  assert.equal(metrics.conversion(0, 0), null);
});

test("calcula ticket médio e CAC", () => {
  assert.equal(metrics.average(199, 10), 19.9);
  assert.equal(metrics.average(300, 6), 50);
});

test("calcula engajamento com etapas AARRR por aquisição", () => {
  const counts = { acquisition: 4, activation: 3, retention: 2, revenue: 1, recommendation: 1 };
  assert.equal(metrics.engagementActions(counts), 7);
  assert.equal(metrics.engagement(counts), 1.75);
  assert.equal(metrics.engagement({ ...counts, acquisition: 0 }), null);
});

test("calcula crescimento de aquisições de hoje contra ontem", () => {
  const trend = metrics.acquisitionTrend({
    "2026-10-25": 4,
    "2026-10-26": 6
  }, "2026-10-26");
  assert.deepEqual(trend, { today: 6, yesterday: 4, growth: 50, previousDate: "2026-10-25" });
  assert.equal(metrics.acquisitionTrend({ "2026-10-26": 2 }, "2026-10-26").growth, null);
});

test("registra uma nova aquisição sem apagar os totais anteriores", () => {
  const state = {
    version: 3,
    counts: { acquisition: 3, activation: 2, retention: 1, revenue: 1, recommendation: 0 },
    journey: { activation: true, retention: true, revenue: true, recommendation: false },
    ratings: { promoters: 0, neutrals: 0, detractors: 0 },
    dailyAcquisition: { "2026-10-26": 2 }
  };
  const next = metrics.startFunnelVisit(state, "2026-10-26");
  assert.equal(next.counts.acquisition, 4);
  assert.equal(next.dailyAcquisition["2026-10-26"], 3);
  assert.equal(next.counts.activation, 2);
  assert.deepEqual(next.journey, { activation: false, retention: false, revenue: false, recommendation: false });
  assert.equal(state.counts.acquisition, 3);
});

test("avança o funil uma vez por etapa e exige a ordem AARRR", () => {
  const initial = {
    version: 3,
    counts: { acquisition: 1, activation: 0, retention: 0, revenue: 0, recommendation: 0 },
    journey: { activation: false, retention: false, revenue: false, recommendation: false },
    ratings: { promoters: 0, neutrals: 0, detractors: 0 },
    dailyAcquisition: {}
  };
  assert.throws(() => metrics.advanceFunnel(initial, "revenue"), /etapas anteriores/);
  const activated = metrics.advanceFunnel(initial, "activation");
  assert.equal(activated.counts.activation, 1);
  assert.equal(metrics.advanceFunnel(activated, "activation"), activated);
  const retained = metrics.advanceFunnel(activated, "retention");
  const paid = metrics.advanceFunnel(retained, "revenue");
  const recommended = metrics.registerFunnelRating(paid, 10);
  assert.deepEqual(recommended.counts, { acquisition: 1, activation: 1, retention: 1, revenue: 1, recommendation: 1 });
  assert.deepEqual(recommended.ratings, { promoters: 1, neutrals: 0, detractors: 0 });
});

test("a nota NPS é classificada automaticamente e só promotores recomendam", () => {
  const base = {
    version: 3,
    counts: { acquisition: 3, activation: 3, retention: 3, revenue: 3, recommendation: 0 },
    journey: { activation: true, retention: true, revenue: true, recommendation: false },
    ratings: { promoters: 0, neutrals: 0, detractors: 0 },
    dailyAcquisition: {}
  };
  const detractor = metrics.registerFunnelRating(base, 6);
  const neutral = metrics.registerFunnelRating({ ...base, journey: { ...base.journey, recommendation: false } }, 8);
  const promoter = metrics.registerFunnelRating({ ...base, journey: { ...base.journey, recommendation: false } }, 9);
  assert.deepEqual(detractor.ratings, { promoters: 0, neutrals: 0, detractors: 1 });
  assert.equal(detractor.counts.recommendation, 0);
  assert.deepEqual(neutral.ratings, { promoters: 0, neutrals: 1, detractors: 0 });
  assert.equal(neutral.counts.recommendation, 0);
  assert.deepEqual(promoter.ratings, { promoters: 1, neutrals: 0, detractors: 0 });
  assert.equal(promoter.counts.recommendation, 1);
  assert.equal(metrics.npsFromRatings({ promoters: 2, neutrals: 1, detractors: 1 }), 25);
  assert.throws(() => metrics.registerFunnelRating(base, 11), /inteiro de 0 a 10/);
});

test("converte as etapas AARRR e identifica empate na maior queda", () => {
  const rates = metrics.funnelRates({ acquisition: 100, activation: 50, retention: 10, revenue: 2, recommendation: 0 });
  assert.deepEqual(rates.map((rate) => rate.value), [50, 20, 20, 0]);
  assert.deepEqual(metrics.largestFunnelDrop(rates).map((rate) => rate.name), ["Receita → Recomendação"]);
  const incomplete = metrics.funnelRates({ acquisition: 1, activation: 0, retention: 0, revenue: 0, recommendation: 0 });
  assert.deepEqual(metrics.largestFunnelDrop(incomplete), []);
});
