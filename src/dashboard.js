import Highcharts from "highcharts";
import MapModule from "highcharts/modules/map";
import map from "@highcharts/map-collection/countries/ca/ca-all.geo.json";
import data from "./data_management/runs.json";

MapModule(Highcharts);

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

const cerPalette = {
  "Night Sky": "#054169",
  Sun: "#FFBE4B",
  Ocean: "#5FBEE6",
  Forest: "#559B37",
  Flame: "#FF821E",
  Aubergine: "#871455",
  "Dim Grey": "#8c8c96",
  "Cool Grey": "#42464B",
  hcPink: "#f15c80",
  hcRed: "#f45b5b",
  hcAqua: "#2b908f",
  hcPurple: "#8085e9",
  hcLightBlue: "#91e8e1",
};

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

    yAxis: {
      max: maxY,
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
      height: 320,
      margin: [0, 0, 0, 0],
      map,
    },
    title: {
      text: "",
    },
    credits: {
      text: "",
    },
    series: [
      {
        name: "Basemap",
        borderColor: "#606060",
        nullColor: "rgba(200, 200, 200, 0.2)",
        showInLegend: false,
      },
    ],
  });
}

function mainCrudeRuns() {
  const mapRegions = createMap();
  const series = seriesify(data);
  console.log(series);
  testChart(series.west, series.maxValue);
  testChart(series.east, series.maxValue);
  testChart(series.quebec, series.maxValue);
}

mainCrudeRuns();
