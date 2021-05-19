import Highcharts from "highcharts";
import MapModule from "highcharts/modules/map";
import map from "@highcharts/map-collection/countries/ca/ca-all.geo.json";
import data from "./data_management/runs.json";
import { cerPalette } from "./util";
import { generalTheme } from "./themes";

MapModule(Highcharts);
generalTheme(Highcharts);

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

function createMap(div = "canada-map") {
  return new Highcharts.mapChart(div, {
    chart: {
      type: "map",
      height: 330,
      margin: [0, 0, 20, 0],
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
      floating: false,
      y: 15,
    },
    tooltip: {
      useHTML: true,
      formatter: function mapTooltip() {
        if (this.point.value > 0) {
          const header = `<strong>${this.series.name}</strong><br>`;
          const postWord = this.point.value > 1 ? "refineries" : "refinery";
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
        name: "Western Canada",
        data: [
          ["ca-ab", 5],
          ["ca-bc", 2],
          ["ca-sk", 2],
        ],
        color: cerPalette["Night Sky"],
      },
      {
        name: "Ontario",
        data: [["ca-on", 4]],
        color: cerPalette.Ocean,
      },
      {
        name: "Quebec & Eastern Canada",
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

function seriesify(runData, unitsHolder) {
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
  let [west, east, quebec] = [
    {
      div: "runs-west",
      data: [
        {
          name: "Western Canada",
          id: "runs",
          data: [],
          color: cerPalette["Night Sky"],
          type: "area",
        },
        {
          name: "Capacity",
          data: [],
          color: cerPalette["Cool Grey"],
          type: "line",
        },
      ],
    },
    {
      div: "runs-east",
      data: [
        {
          name: "Quebec & Eastern Canada",
          id: "runs",
          data: [],
          color: cerPalette.Flame,
          type: "area",
        },
        {
          name: "Capacity",
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
          name: "Ontario",
          id: "runs",
          data: [],
          color: cerPalette.Ocean,
          type: "area",
        },
        {
          name: "Capacity",
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
      [east, maxValue] = adder(east, row, maxValue);
    } else if (row.r === "q") {
      [quebec, maxValue] = adder(quebec, row, maxValue);
    }
  });

  return { west, east, quebec, maxValue };
}

const dateFormat = (value, format = "%b %d, %Y") =>
  Highcharts.dateFormat(format, value);

function regionChartTooltip(event, units) {
  const utilization = ((event.points[0].y / event.points[1].y) * 100).toFixed(
    0
  );
  let table = `<table>`;
  table += `<caption style="padding:0px; padding-bottom:5px">${dateFormat(
    event.x
  )}</caption>`;
  table += `<tr><td>Weekly runs:&nbsp</td><td><strong>${event.points[0].y}&nbsp${units.label}</strong></td>`;
  table += `<tr><td>Capacity:&nbsp</td><td><strong>${event.points[1].y}&nbsp${units.label}<strong></td>`;
  table += `<tr style="border-top: 1px solid grey"><td>Utilization:&nbsp</td><td><strong>${utilization}&nbsp%<strong></td>`;
  table += `</table>`;
  return table;
}

function createRegionChart(series, maxY, units) {
  return Highcharts.chart(series.div, {
    chart: {
      zoomType: "x",
      spacingBottom: 5,
      spacingTop: 5,
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
        return regionChartTooltip(this, units);
      },
    },

    series: series.data,
  });
}

function buildAllRunCharts(series, units) {
  const westChart = createRegionChart(series.west, series.maxValue, units);
  const eastChart = createRegionChart(series.east, series.maxValue, units);
  const quebecChart = createRegionChart(series.quebec, series.maxValue, units);
  return [westChart, eastChart, quebecChart];
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

function unitsLabel(units) {
  if (units.current === "m3/d") {
    return "thousand m3/d";
  }
  return "thousand b/d";
}

function mainCrudeRuns() {
  const unitsHolder = { current: "b/d", base: "b/d" };
  unitsHolder.label = unitsLabel(unitsHolder);
  createMap();
  let series = seriesify(data, unitsHolder);
  const [westChart, eastChart, quebecChart] = buildAllRunCharts(
    series,
    unitsHolder
  );

  // user selects units
  document.getElementById("radio-units").addEventListener("click", (event) => {
    if (event.target && event.target.value) {
      const radioValue = event.target.value;
      unitsHolder.current = radioValue;
      unitsHolder.label = unitsLabel(unitsHolder);
      // let yTitle = "";
      // if (unitsHolder.current === "b/d") {
      //   yTitle = "thousand b/d";
      // } else if (unitsHolder.current === "m3/d") {
      //   yTitle = "thousand m3/d";
      // }
      series = seriesify(data, unitsHolder);
      updateRegionChart(westChart, series, "west", unitsHolder);
      updateRegionChart(eastChart, series, "east", unitsHolder);
      updateRegionChart(quebecChart, series, "quebec", unitsHolder);
    }
  });
}

mainCrudeRuns();
