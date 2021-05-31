const lang = {
  en: {
    h1: "Weekly Crude Run Summary and Data",
    mapHeader: "Crude Region Map",
    whatHeader: "What are Crude Runs?",
    chartHeader: "Crude Run Charts",
    instructionsHeader: "Dashboard Instructions",
    units: { imperial: "thousand b/d", metric: "thousand m3/d" },
    whatP: {
      one: `Crude runs represent the volume of crude oil consumed by
      refineries. The crude oil is then processed into various refined
      products such as
      <i class="bg-info text-highlight"
        >&nbspgasoline, diesel, and jet fuel&nbsp</i
      >. Manitoba, Nova Scotia, PEI, and the Territories do not have
      crude oil refineries.`,
      two: `Data is provided to the CER
      <i class="bg-info text-highlight"
        >&nbspvoluntarily by the refinery operators,&nbsp</i
      >
      and aggregated into three regions for confidentiality reasons.`,
      three: `<i class="bg-info text-highlight"
      >&nbspRefining capacity is an estimate&nbsp</i
    >
    and fluctuates over time based on several factors such as the
    type of crude entering the refinery, and the desired refined
    product mix produced.`,
      four: `This dashboard is updated monthly. Please take a look at the
    <i class="bg-info text-highlight"
      >&nbspdata download options below&nbsp</i
    >
    for the most recent data with additional metrics such as
    four-week average and year-to-date average.`,
    },
    instructionsP: {
      one: "Click and drag your cursor on one of the charts to filter to a desired date range for all charts. Click on the reset zoom button in the top right of the chart to return to full date zoom.",
    },
  },
  fr: {
    h1: "Sommaires et données des charges hebdomadaires",
    mapHeader: "Crude Region Map FR",
    whatHeader: "What are Crude Runs? FR",
    chartHeader: "Crude Run Charts FR",
    instructionsHeader: "Dashboard Instructions FR",
    units: { imperial: "thousand b/d FR", metric: "thousand m3/d FR" },
    whatP: {
      one: `FR: Crude runs represent the volume of crude oil consumed by
      refineries. The crude oil is then processed into various refined
      products such as
      <i class="bg-info text-highlight"
        >&nbspgasoline, diesel, and jet fuel&nbsp</i
      >. Manitoba, Nova Scotia, PEI, and the Territories do not have
      crude oil refineries.`,
      two: `FR: Data is provided to the CER
      <i class="bg-info text-highlight"
        >&nbspvoluntarily by the refinery operators,&nbsp</i
      >
      and aggregated into three regions for confidentiality reasons.`,
      three: `FR: <i class="bg-info text-highlight"
      >&nbspRefining capacity is an estimate&nbsp</i
    >
    and fluctuates over time based on several factors such as the
    type of crude entering the refinery, and the desired refined
    product mix produced.`,
      four: `FR: This dashboard is updated monthly. Please take a look at the
    <i class="bg-info text-highlight"
      >&nbspdata download options below&nbsp</i
    >
    for the most recent data with additional metrics such as
    four-week average and year-to-date average.`,
    },
    instructionsP: {
      one: "FR Click and drag your cursor on one of the charts to filter to a desired date range for all charts. Click on the reset zoom button in the top right of the chart to return to full date zoom.",
    },
  },
};

module.exports = lang;
