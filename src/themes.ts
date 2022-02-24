import { cerPalette } from "./util";

export const generalTheme = (Highcharts: any) => {
  Highcharts.profiles = {
    chart: {
      animation: true,
    },
    plotOptions: {
      column: {
        stacking: "normal",
      },
      area: {
        stacking: "normal",
      },
      bar: {
        stacking: "normal",
      },
    },

    xAxis: {
      title: {
        style: {
          fontSize: 12,
          color: cerPalette["Cool Grey"],
          fontWeight: "bold",
          fontFamily: "Arial",
        },
      },
      labels: {
        style: {
          fontSize: 12,
          color: cerPalette["Cool Grey"],
        },
      },
    },

    yAxis: {
      title: {
        style: {
          fontSize: 12,
          color: cerPalette["Cool Grey"],
          fontWeight: "bold",
          fontFamily: "Arial",
        },
      },
      labels: {
        formatter(): string {
          return Highcharts.numberFormat(this.value, 0, ".", ",");
        },
        style: {
          fontSize: 12,
          color: cerPalette["Cool Grey"],
        },
      },
      stackLabels: {
        style: {
          fontWeight: "bold",
          color: (Highcharts.theme && Highcharts.theme.textColor) || "grey",
        },
      },
    },

    legend: {
      itemStyle: {
        fontSize: "15px",
      },
    },

    credits: {
      text: "",
    },

    title: {
      text: "",
      style: {
        fontSize: "16px",
        fontWeight: "bold",
      },
    },
  };

  Highcharts.setOptions(Highcharts.profiles);
};

export const frenchTheme = (Highcharts: any) => {
  Highcharts.french = {
    lang: {
      months: [
        "Janvier",
        "Février",
        "Mars",
        "Avril",
        "Mai",
        "Juin",
        "Juillet",
        "Août",
        "Septembre",
        "Octobre",
        "Novembre",
        "Décembre",
      ],
      shortMonths: [
        "jan",
        "fév",
        "mar",
        "avr",
        "mai",
        "juin",
        "juil",
        "aoû",
        "sep",
        "oct",
        "nov",
        "déc",
      ],
      weekdays: [
        "Dimanche",
        "Lundi",
        "Mardi",
        "Mercredi",
        "Jeudi",
        "Vendredi",
        "Samedi",
      ],
      decimalPoint: ",",
      resetZoom: "réinitialiser le zoom",
    },
  };
  Highcharts.setOptions(Highcharts.french);
};
