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

function seriesify(runData) {
  const addToSeries = (series, row) => {
    series.data[0].data.push([row.d, row.v]);
    series.data[1].data.push([row.d, row.c]);
    return series;
  };
  let [west, east, quebec] = [
    {
      div: "runs-west",
      data: [
        {
          name: "Western Canada",
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
        { name: "Ontario", data: [], color: cerPalette.Ocean, type: "area" },
        {
          name: "Capacity",
          data: [],
          color: cerPalette["Cool Grey"],
          type: "line",
        },
      ],
    },
  ];
  console.log(runData);
  let maxValue = 0;
  runData.forEach((row) => {
    if (row.r === "w") {
      west = addToSeries(west, row);
    } else if (row.r === "o") {
      east = addToSeries(east, row);
    } else if (row.r === "q") {
      quebec = addToSeries(quebec, row);
    }
    if (row.c > maxValue) {
      maxValue = row.c;
    }
  });

  return { west, east, quebec, maxValue };
}

function testChart(series, maxY) {
  Highcharts.chart(series.div, {
    chart: {
      zoomType: "x",
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
    },

    yAxis: {
      max: maxY + 15,
      title: {
        text: "thousand b/d",
      },
      startOnTick: false,
      endOnTick: false,
    },

    tooltip: {
      shared: true,
    },

    series: series.data,
  });
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

function mainCrudeRuns() {
  const mapRegions = createMap();
  const series = seriesify(data);
  console.log(mapRegions);
  testChart(series.west, series.maxValue);
  testChart(series.east, series.maxValue);
  testChart(series.quebec, series.maxValue);
}

mainCrudeRuns();
