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
    updated: (now: string, next: string) =>
      `Chart data updated on <strong>${now}</strong>. Next update: second week of <strong>${next}</strong>.`,
    error: { header: "Chart Error", message: "Please try again later." },
    outOfDate:
      "The data in this dashboard may be out of date. Please check back later.",
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
    updated: (now: string, next: string) =>
      `Données des graphiques mises à jour le <strong>${now}</strong>. Prochaine mise à jour : seconde semaine de <strong>${next}</strong>.`,
    error: {
      header: "Erreur de graphique",
      message: "Veuillez réessayer plus tard.",
    },
    outOfDate:
      "Les données de ce tableau de bord peuvent être obsolètes. Veuillez vérifier plus tard.",
  },
};
