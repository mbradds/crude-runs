export const lang = {
  en: {
    units: { imperial: "thousand b/d", metric: "thousand m3/d" },
    seriesNames: {
      west: "Western Canada",
      quebec: "Quebec & Eastern Canada",
      ontario: "Ontario",
      capacity: "Capacity",
    },
    toolTip: {
      runs: "Weekly runs:",
      cap: "Capacity:",
      util: "Utilization:",
    },
    refinery: "refinery",
    refineries: "refineries",
    numberFormat: { seperator: " ", decimal: "." },
    updated: (now, next) =>
      `Chart data updated on <strong>${now}</strong>. Next update: first week of <strong>${next}</strong>.`,
  },
  fr: {
    units: { imperial: "milliers de b/j", metric: "milliers de m3/j" },
    seriesNames: {
      west: "Ouest canadien",
      quebec: "Québec et Est du Canada",
      ontario: "Ontario",
      capacity: "Capacité",
    },
    toolTip: {
      runs: "Charges hebdomadaires :",
      cap: "Capacité :",
      util: "Utilisation :",
    },
    refinery: "raffinerie",
    refineries: "raffineries",
    numberFormat: { seperator: " ", decimal: "," },
    updated: (now, next) =>
      `Données des graphiques mises à jour le <strong>${now}</strong>. Prochaine mise à jour : première semaine de <strong>${next}</strong>.`,
  },
};
