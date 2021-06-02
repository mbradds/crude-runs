import Highcharts from "highcharts";
import MapModule from "highcharts/modules/map";
import map from "@highcharts/map-collection/countries/ca/ca-all.geo.json";
import data from "./data_management/runs.json";
import meta from "./data_management/meta.json";
import { cerPalette } from "./util";
import { generalTheme } from "./themes";

MapModule(Highcharts);
generalTheme(Highcharts);

function addUpdated(lang) {
  const now = new Date(meta.updated[0], meta.updated[1], meta.updated[2]);
  const nowString = Highcharts.dateFormat("%b %d, %Y", now);

  const next = new Date(now.setMonth(now.getMonth() + 1));
  const nextString = Highcharts.dateFormat("%b %Y", next);

  document.getElementById("updated").innerHTML = lang.updated(
    nowString,
    nextString
  );
}

function syncExtremes(e) {
  const thisChart = this.chart;

  if (e.trigger !== "syncExtremes") {
    // Prevent feedback loop
    Highcharts.charts.forEach((chart) => {
      if (chart !== thisChart) {
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

function createMap(lang, div = "canada-map") {
  return new Highcharts.mapChart(div, {
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

const dateFormat = (value, format = "%b %d, %Y") =>
  Highcharts.dateFormat(format, value);

function regionChartTooltip(event, units, langTool) {
  const utilization = ((event.points[0].y / event.points[1].y) * 100).toFixed(
    0
  );
  let table = `<table>`;
  table += `<caption style="padding:0px; padding-bottom:5px">${dateFormat(
    event.x
  )}</caption>`;
  table += `<tr><td>${langTool.runs}&nbsp</td><td><strong>${event.points[0].y}&nbsp${units.label}</strong></td>`;
  table += `<tr><td>${langTool.cap}&nbsp</td><td><strong>${event.points[1].y}&nbsp${units.label}<strong></td>`;
  table += `<tr style="border-top: 1px solid grey"><td>${langTool.util}&nbsp</td><td><strong>${utilization}&nbsp%<strong></td>`;
  table += `</table>`;
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

export function mainCrudeRuns(lang, languageTheme = false) {
  if (languageTheme) {
    languageTheme(Highcharts);
  }
  addUpdated(lang);
  const unitsHolder = { current: "b/d", base: "b/d" };
  unitsHolder.label = unitsLabel(unitsHolder, lang);
  createMap(lang);
  let series = seriesify(data, unitsHolder, lang);
  const [westChart, ontarioChart, quebecChart] = buildAllRunCharts(
    series,
    unitsHolder,
    lang
  );

  // user selects units
  document.getElementById("radio-units").addEventListener("click", (event) => {
    if (event.target && event.target.value) {
      const radioValue = event.target.value;
      unitsHolder.current = radioValue;
      unitsHolder.label = unitsLabel(unitsHolder, lang);
      series = seriesify(data, unitsHolder, lang);
      updateRegionChart(westChart, series, "west", unitsHolder);
      updateRegionChart(ontarioChart, series, "ontario", unitsHolder);
      updateRegionChart(quebecChart, series, "quebec", unitsHolder);
    }
  });
}
