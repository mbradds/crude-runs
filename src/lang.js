export const lang = {
  en: {
    units: { imperial: "thousand b/d", metric: "thousand m3/d" },
    seriesNames: {
      west: "Western Canada",
      quebec: "Quebec & Eastern Canada",
      ontario: "Ontario",
    },
    numberFormat: { seperator: " ", decimal: "." },
    updated: (now, next) =>
      `Chart data updated on <strong>${now}</strong>. Next update scheduled: first week of <strong>${next}</strong>.`,
  },
  fr: {
    units: { imperial: "thousand b/d FR", metric: "thousand m3/d FR" },
    seriesNames: {
      west: "Western Canada",
      quebec: "Quebec & Eastern Canada",
      ontario: "Ontario",
    },
    numberFormat: { seperator: " ", decimal: "," },
    updated: (now, next) =>
      `Chart data updated on <strong>${now}</strong>. Next update: first week of <strong>${next}</strong>.`,
  },
};
