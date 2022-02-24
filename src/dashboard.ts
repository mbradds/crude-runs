import Highcharts from "highcharts";
import MapModule from "highcharts/modules/map.js";
import map from "@highcharts/map-collection/countries/ca/ca-all.geo.json";
import "core-js/modules/es.promise.js";
import "whatwg-fetch";
import { cerPalette } from "./util";
import { generalTheme } from "./themes";
import { Language } from "./interfaces";
import "./css/main.css";

MapModule(Highcharts);
generalTheme(Highcharts);

interface RunsData {
  data: string;
  updated: number[];
}

interface RunsDataParsed {
  d: number;
  r: string;
  v: number;
  c: number;
}

interface UnitsHolder {
  current: string;
  base: string;
  label: string;
}

interface SeriesAdder {
  div: string;
  data: {
    name: string;
    id?: string;
    data: number[][];
    color: string;
    type: string;
  }[];
}

interface ThreeRegionSeries {
  west: SeriesAdder;
  ontario: SeriesAdder;
  quebec: SeriesAdder;
  maxValue: number;
}

function addUpdated(runsData: RunsData, lang: Language) {
  const lastUpdated = runsData.updated;
  const now = new Date(lastUpdated[0], lastUpdated[1], lastUpdated[2]);
  const next = new Date(now.setMonth(now.getMonth() + 1));
  const updatedDiv = document.getElementById("updated");
  if (updatedDiv) {
    updatedDiv.innerHTML = lang.updated(
      Highcharts.dateFormat("%b %d, %Y", now.getTime()),
      Highcharts.dateFormat("%b %Y", next.getTime())
    );
  }
}

async function createMap(lang: Language, div = "canada-map") {
  return Highcharts.mapChart({
    chart: {
      renderTo: div,
      type: "map",
      height: 350,
      margin: [0, 0, 20, 0],
      spacingBottom: 0,
      map,
    },
    title: {
      text: "",
    },
    credits: {
      enabled: false,
    },
    plotOptions: {
      map: {
        allAreas: false,
      },
      series: {
        events: {
          legendItemClick: function noClick() {
            return false;
          },
        },
      },
    },
    legend: {
      align: "center",
      verticalAlign: "bottom",
      backgroundColor: "white",
      itemDistance: 10,
      symbolPadding: 3,
      padding: 3,
    },
    tooltip: {
      useHTML: true,
      formatter: function mapTooltip() {
        if (this.point.value && this.point.value > 0) {
          const header = `<strong>${this.series.name}</strong><br>`;
          const postWord =
            this.point.value > 1 ? lang.refineries : lang.refinery;
          const body = `${this.key} - ${this.point.value} ${postWord}`;
          return header + body;
        }
        return false;
      },
    },
    series: [
      {
        name: "Basemap",
        borderColor: "#606060",
        nullColor: "rgba(200, 200, 200, 0.2)",
        showInLegend: false,
        type: "map",
      },
      {
        name: lang.seriesNames.west,
        type: "map",
        data: [
          ["ca-ab", 5],
          ["ca-bc", 2],
          ["ca-sk", 2],
        ],
        color: cerPalette["Night Sky"],
      },
      {
        name: lang.seriesNames.ontario,
        type: "map",
        data: [["ca-on", 4]],
        color: cerPalette.Ocean,
      },
      {
        name: lang.seriesNames.quebec,
        type: "map",
        data: [
          ["ca-qc", 2],
          ["ca-nb", 1],
          ["ca-nl", 1],
        ],
        color: cerPalette.Flame,
      },
      {
        name: "no-refinery",
        type: "map",
        borderColor: "#606060",
        nullColor: "rgba(200, 200, 200, 0.2)",
        color: "rgba(200, 200, 200, 0.2)",
        data: [
          ["ca-nu", 0],
          ["ca-ns", 0],
          ["ca-nt", 0],
          ["ca-pe", 0],
          ["ca-yt", 0],
          ["ca-mb", 0],
        ],
        showInLegend: false,
      },
    ],
  });
}

function seriesify(
  runData: RunsDataParsed[],
  unitsHolder: UnitsHolder,
  lang: Language
): ThreeRegionSeries {
  const addToSeries = (units: UnitsHolder): Function => {
    if (units.current === "m3/d") {
      return function adder(
        series: SeriesAdder,
        row: RunsDataParsed,
        maxValue: number
      ) {
        const capacity = parseFloat((row.c / 6.2898).toFixed(1));
        const runs = parseFloat((row.v / 6.2898).toFixed(1));
        series.data[0].data.push([row.d, runs]);
        series.data[1].data.push([row.d, capacity]);
        if (capacity > maxValue) {
          return [series, capacity];
        }
        return [series, maxValue];
      };
    }
    return function adder(
      series: SeriesAdder,
      row: RunsDataParsed,
      maxValue: number
    ) {
      series.data[0].data.push([row.d, row.v]);
      series.data[1].data.push([row.d, row.c]);
      if (row.c > maxValue) {
        return [series, row.c];
      }
      return [series, maxValue];
    };
  };

  let [west, quebec, ontario]: SeriesAdder[] = [
    {
      div: "runs-west",
      data: [
        {
          name: lang.seriesNames.west,
          id: "runs",
          data: [],
          color: cerPalette["Night Sky"],
          type: "area",
        },
        {
          name: lang.seriesNames.capacity,
          data: [],
          color: cerPalette["Cool Grey"],
          type: "line",
        },
      ],
    },
    {
      div: "runs-quebec",
      data: [
        {
          name: lang.seriesNames.quebec,
          id: "runs",
          data: [],
          color: cerPalette.Flame,
          type: "area",
        },
        {
          name: lang.seriesNames.capacity,
          data: [],
          color: cerPalette["Cool Grey"],
          type: "line",
        },
      ],
    },
    {
      div: "runs-ontario",
      data: [
        {
          name: lang.seriesNames.ontario,
          id: "runs",
          data: [],
          color: cerPalette.Ocean,
          type: "area",
        },
        {
          name: lang.seriesNames.capacity,
          data: [],
          color: cerPalette["Cool Grey"],
          type: "line",
        },
      ],
    },
  ];

  let maxValue = 0;
  const adder = addToSeries(unitsHolder);
  runData.forEach((row: RunsDataParsed) => {
    if (row.r === "w") {
      [west, maxValue] = adder(west, row, maxValue);
    } else if (row.r === "o") {
      [ontario, maxValue] = adder(ontario, row, maxValue);
    } else if (row.r === "q") {
      [quebec, maxValue] = adder(quebec, row, maxValue);
    }
  });

  return { west, ontario, quebec, maxValue };
}

function regionChartTooltip(
  event: Highcharts.TooltipFormatterContextObject,
  units: UnitsHolder,
  langTool: Language["toolTip"]
) {
  let table = `<table><caption style="padding:0px; padding-bottom:5px">${Highcharts.dateFormat(
    "%b %d, %Y",
    event.x
  )}</caption>`;

  if (event.points) {
    table += `<tr><td>${langTool.runs}&nbsp</td><td><strong>${event.points[0].y}&nbsp${units.label}</strong></td>`;
    table += `<tr><td>${langTool.cap}&nbsp</td><td><strong>${event.points[1].y}&nbsp${units.label}<strong></td>`;
    table += `<tr style="border-top: 1px solid grey"><td>${
      langTool.util
    }&nbsp</td><td><strong>${(
      (event.points[0].y / event.points[1].y) *
      100
    ).toFixed(0)}&nbsp%<strong></td>`;
  }
  table += "</table>";
  return table;
}

function createRegionChart(
  series: any,
  maxY: number,
  units: UnitsHolder,
  lang: Language
) {
  return Highcharts.chart(series.div, {
    chart: {
      zoomType: "x",
      spacingBottom: 5,
      spacingTop: 7,
    },
    title: {
      text: "",
    },
    credits: {
      text: "",
    },
    xAxis: {
      type: "datetime",
      crosshair: true,
      events: {
        setExtremes(e) {
          const thisChart = this.chart;
          if (e.trigger !== "syncExtremes") {
            // Prevent feedback loop
            Highcharts.charts.forEach((chart) => {
              if (
                chart !== thisChart &&
                chart &&
                chart.options &&
                chart.options.chart &&
                chart.options.chart.type !== "map"
              ) {
                chart.xAxis[0].setExtremes(e.min, e.max, undefined, false, {
                  trigger: "syncExtremes",
                });
              }
            });
          }
        },
      },
    },
    plotOptions: {
      line: {
        lineWidth: 3,
      },
      series: {
        events: {
          legendItemClick: function noClick() {
            return false;
          },
        },
      },
    },
    legend: {
      margin: 5,
    },
    yAxis: {
      max: maxY,
      title: {
        text: units.label,
      },
      tickAmount: 5,
      endOnTick: false,
    },
    tooltip: {
      shared: true,
      useHTML: true,
      backgroundColor: "white",
      formatter: function buildTooltip() {
        return regionChartTooltip(this, units, lang.toolTip);
      },
    },
    series: series.data,
  });
}

function buildAllRunCharts(
  series: ThreeRegionSeries,
  units: UnitsHolder,
  lang: Language
) {
  const westChart = createRegionChart(
    series.west,
    series.maxValue,
    units,
    lang
  );
  const ontarioChart = createRegionChart(
    series.ontario,
    series.maxValue,
    units,
    lang
  );
  const quebecChart = createRegionChart(
    series.quebec,
    series.maxValue,
    units,
    lang
  );
  return [westChart, ontarioChart, quebecChart];
}

function updateRegionChart(
  chart: Highcharts.Chart,
  series: any,
  region: string,
  units: UnitsHolder
) {
  chart.update({
    series: series[region].data,
    yAxis: {
      max: series.maxValue,
      title: {
        text: units.label,
      },
    },
  });
}

function unitsLabel(units: UnitsHolder, lang: Language) {
  if (units.current === "m3/d") {
    return lang.units.metric;
  }
  return lang.units.imperial;
}

/**
 * Overrides the wet4 equal height if it doesnt work.
 * @param divId1 - HTML id of div to compare to second parameter
 * @param divId2 - HMTL id of div to compare to first parameter
 */
export function equalizeHeight(divId1: string, divId2: string) {
  const d1 = document.getElementById(divId1);
  const d2 = document.getElementById(divId2);

  if (d1 && d2) {
    d1.style.height = "auto";
    d2.style.height = "auto";
    const d1Height = d1.clientHeight;
    const d2Height = d2.clientHeight;

    const maxHeight = Math.max(d1Height, d2Height);
    if (d1Height !== maxHeight || d2Height !== maxHeight) {
      d1.style.height = `${maxHeight}px`;
      d2.style.height = `${maxHeight}px`;
    }
  }
}

function displayErrorMsg(lang: Language) {
  const errorDiv = document.getElementById("complete-dashboard");
  if (errorDiv) {
    errorDiv.innerHTML = `<section class="alert alert-danger">
    <h3>${lang.error.header}</h3>${lang.error.message}</section>`;
  }
}

function removeSpinningLoader(divId: string) {
  const spinnerDiv = document.getElementById(divId);
  if (spinnerDiv) {
    spinnerDiv.style.display = "none";
  }
}

function buildDashboard(
  runsData: RunsData,
  lang: Language,
  languageTheme: any
) {
  if (languageTheme) {
    languageTheme(Highcharts);
  }
  addUpdated(runsData, lang);
  const unitsHolder = { current: "b/d", base: "b/d", label: "" };
  unitsHolder.label = unitsLabel(unitsHolder, lang);

  createMap(lang)
    .then(() => {
      removeSpinningLoader("map-loader");
      equalizeHeight("eq-ht-1", "eq-ht-2");
    })
    .catch((e) => {
      console.warn(e);
      removeSpinningLoader("map-loader");
      createMap(lang);
    });

  const chartData = JSON.parse(runsData.data);
  let series = seriesify(chartData, unitsHolder, lang);
  const [westChart, ontarioChart, quebecChart] = buildAllRunCharts(
    series,
    unitsHolder,
    lang
  );

  // user selects units
  const unitsSelectDiv = document.getElementById("radio-units");
  if (unitsSelectDiv) {
    unitsSelectDiv.addEventListener("click", (event) => {
      if (event.target && (<HTMLInputElement>event.target).value) {
        unitsHolder.current = (<HTMLInputElement>event.target).value;
        unitsHolder.label = unitsLabel(unitsHolder, lang);
        series = seriesify(chartData, unitsHolder, lang);
        updateRegionChart(westChart, series, "west", unitsHolder);
        updateRegionChart(ontarioChart, series, "ontario", unitsHolder);
        updateRegionChart(quebecChart, series, "quebec", unitsHolder);
      }
    });
  }
}

async function fetchErrorBackup(lang: Language) {
  removeSpinningLoader("chart-loader");
  // add out of date warning
  const outOfDateDiv = document.getElementById("out-of-date-warning");
  if (outOfDateDiv) {
    outOfDateDiv.innerHTML = `<div class="alert alert-warning"><p>${lang.outOfDate}</p></div>`;
  }

  try {
    const { default: runsData } = await import(
      /* webpackChunkName: "backupData" */ "./data_management/runs.json"
    );
    return runsData;
  } catch (err) {
    return displayErrorMsg(lang);
  }
}

export function dashboard(
  lang: Language,
  languageTheme: boolean | any = false
) {
  fetch("https://cer-production.azureedge.net/crude-run-data/runs.json")
    .then((response) => {
      if (response.ok) {
        return response.json();
      }
      return fetchErrorBackup(lang);
    })
    .then((data) => {
      removeSpinningLoader("chart-loader");
      return buildDashboard(data, lang, languageTheme);
    })
    .catch((error) => {
      console.warn(error);
      return displayErrorMsg(lang);
    });
}
