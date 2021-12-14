import Highcharts from "highcharts";
import MapModule from "highcharts/modules/map.js";
import map from "@highcharts/map-collection/countries/ca/ca-all.geo.json";
import "core-js/modules/es.promise.js";
import "whatwg-fetch";
import { cerPalette } from "./util.js";
import { generalTheme } from "./themes.js";
import "./css/main.css";

MapModule(Highcharts);
generalTheme(Highcharts);

function addUpdated(runsData, lang) {
  const lastUpdated = runsData.updated;
  const now = new Date(lastUpdated[0], lastUpdated[1], lastUpdated[2]);
  document.getElementById("updated").innerHTML = lang.updated(
    Highcharts.dateFormat("%b %d, %Y", now),
    Highcharts.dateFormat("%b %Y", new Date(now.setMonth(now.getMonth() + 1)))
  );
}

function syncExtremes(e) {
  const thisChart = this.chart;
  if (e.trigger !== "syncExtremes") {
    // Prevent feedback loop
    Highcharts.charts.forEach((chart) => {
      if (chart !== thisChart && chart.options.chart.type !== "map") {
        if (chart.xAxis[0].setExtremes) {
          // It is null while updating
          chart.xAxis[0].setExtremes(e.min, e.max, undefined, false, {
            trigger: "syncExtremes",
          });
        }
      }
    });
  }
}

async function createMap(lang, div = "canada-map") {
  const canada = await new Highcharts.mapChart(div, {
    chart: {
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
        if (this.point.value > 0) {
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
      },
      {
        name: lang.seriesNames.west,
        data: [
          ["ca-ab", 5],
          ["ca-bc", 2],
          ["ca-sk", 2],
        ],
        color: cerPalette["Night Sky"],
      },
      {
        name: lang.seriesNames.ontario,
        data: [["ca-on", 4]],
        color: cerPalette.Ocean,
      },
      {
        name: lang.seriesNames.quebec,
        data: [
          ["ca-qc", 2],
          ["ca-nb", 1],
          ["ca-nl", 1],
        ],
        color: cerPalette.Flame,
      },
      {
        name: "no-refinery",
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
  return canada;
}

function seriesify(runData, unitsHolder, lang) {
  const addToSeries = (units) => {
    if (units.current === "m3/d") {
      return function adder(series, row, maxValue) {
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
    return function adder(series, row, maxValue) {
      series.data[0].data.push([row.d, row.v]);
      series.data[1].data.push([row.d, row.c]);
      if (row.c > maxValue) {
        return [series, row.c];
      }
      return [series, maxValue];
    };
  };

  let [west, quebec, ontario] = [
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
  runData.forEach((row) => {
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

function regionChartTooltip(event, units, langTool) {
  const utilization = ((event.points[0].y / event.points[1].y) * 100).toFixed(
    0
  );
  let table = `<table><caption style="padding:0px; padding-bottom:5px">${Highcharts.dateFormat(
    "%b %d, %Y",
    event.x
  )}</caption>`;
  table += `<tr><td>${langTool.runs}&nbsp</td><td><strong>${event.points[0].y}&nbsp${units.label}</strong></td>`;
  table += `<tr><td>${langTool.cap}&nbsp</td><td><strong>${event.points[1].y}&nbsp${units.label}<strong></td>`;
  table += `<tr style="border-top: 1px solid grey"><td>${langTool.util}&nbsp</td><td><strong>${utilization}&nbsp%<strong></td></table>`;
  return table;
}

function createRegionChart(series, maxY, units, lang) {
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
        setExtremes: syncExtremes,
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

function buildAllRunCharts(series, units, lang) {
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

function updateRegionChart(chart, series, region, units) {
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

function unitsLabel(units, lang) {
  if (units.current === "m3/d") {
    return lang.units.metric;
  }
  return lang.units.imperial;
}

/**
 * Overrides the wet4 equal height if it doesnt work.
 * @param {string} divId1 - HTML id of div to compare to second parameter
 * @param {string} divId2 - HMTL id of div to compare to first parameter
 */
export function equalizeHeight(divId1, divId2) {
  const d1 = document.getElementById(divId1);
  const d2 = document.getElementById(divId2);

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

function displayErrorMsg(lang) {
  document.getElementById(
    "complete-dashboard"
  ).innerHTML = `<section class="alert alert-danger">
  <h3>${lang.error.header}</h3>${lang.error.message}</section>`;
}

function removeSpinningLoader(divId) {
  document.getElementById(divId).style.display = "none";
}

export function buildDashboard(runsData, lang, languageTheme) {
  if (languageTheme) {
    languageTheme(Highcharts);
  }
  addUpdated(runsData, lang);
  const unitsHolder = { current: "b/d", base: "b/d" };
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
  document.getElementById("radio-units").addEventListener("click", (event) => {
    if (event.target && event.target.value) {
      unitsHolder.current = event.target.value;
      unitsHolder.label = unitsLabel(unitsHolder, lang);
      series = seriesify(chartData, unitsHolder, lang);
      updateRegionChart(westChart, series, "west", unitsHolder);
      updateRegionChart(ontarioChart, series, "ontario", unitsHolder);
      updateRegionChart(quebecChart, series, "quebec", unitsHolder);
    }
  });
}

async function fetchErrorBackup(lang) {
  removeSpinningLoader("chart-loader");
  // add out of date warning
  document.getElementById(
    "out-of-date-warning"
  ).innerHTML = `<div class="alert alert-warning"><p>${lang.outOfDate}</p></div>`;
  try {
    const { default: runsData } = await import(
      /* webpackChunkName: "backupData" */ "./data_management/runs.json"
    );
    return runsData;
  } catch (err) {
    return displayErrorMsg(lang);
  }
}

export function mainCrudeRuns(lang, languageTheme = false) {
  fetch("https://cer.blob.core.windows.net/crude-run-data/runs.json")
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
