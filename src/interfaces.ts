export interface Language {
  error: { header: string; message: string };
  numberFormat: { seperator: string; decimal: string };
  outOfDate: string;
  refineries: string;
  refinery: string;
  seriesNames: {
    west: string;
    quebec: string;
    ontario: string;
    capacity: string;
  };
  toolTip: { runs: string; cap: string; util: string };
  units: { imperial: string; metric: string };
  updated: Function;
}
