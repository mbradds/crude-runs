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
    numberFormat: { seperator: " ", decimal: "." },
    updated: (now, next) =>
      `Chart data updated on <strong>${now}</strong>. Next update: first week of <strong>${next}</strong>.`,
  },
  fr: {
    units: { imperial: "thousand b/d FR", metric: "thousand m3/d FR" },
    seriesNames: {
      west: "Ouest canadien",
      quebec: "Québec et Est du Canada",
      ontario: "Ontario",
      capacity: "Capacité",
    },
    toolTip: {
      runs: "Weekly runs: FR",
      cap: "Capacity: FR",
      util: "Utilization: FR",
    },
    numberFormat: { seperator: " ", decimal: "," },
    updated: (now, next) =>
      `Chart data updated on <strong>${now}</strong>. Next update: first week of <strong>${next}</strong>.`,
  },
};
