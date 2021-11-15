import os
import ssl
from datetime import date
import json
import pandas as pd
ssl._create_default_https_context = ssl._create_unverified_context


def set_cwd_to_script():
    dname = os.path.dirname(os.path.abspath(__file__))
    os.chdir(dname)


def get_data():

    # get the existing local data for last date comparison
    if os.path.isfile("./runs.json"):
        current = pd.read_json("./runs.json", convert_dates=["d"])
        current["d"] = pd.to_datetime(current["d"])
        data_up_to = max(current["d"])
    else:
        data_up_to = False

    link = "https://www.cer-rec.gc.ca/en/data-analysis/energy-commodities/crude-oil-petroleum-products/statistics/weekly-crude-run-summary-data/historical-weekly-crude-run-data-donnees-sur-les-charges-hebdomadaires-historiques.xlsx"
    df = pd.read_excel(link, engine="openpyxl")
    cols = list(df.columns)
    df = df[~df[cols[1]].isnull()]
    new_header = [str(x) for x in list(df.iloc[0])]
    new_header = [x.split("/")[0].strip() for x in new_header]
    df = df[1:]
    df.columns = new_header
    for col in df.columns:
        if col in ["nan", "NaT"]:
            try:
                del df[col]
            except:
                None
    for delete in ["Region (french)",
                   "Week End Last Year",
                   "4 Week Average Last Year",
                   "YTD Average Last Year"]:
        del df[delete]

    for num in ["Runs for the week",
                "% of capacity",
                "4 Week Average",
                "YTD Average"]:
        df[num] = pd.to_numeric(df[num])

    df['Week End'] = pd.to_datetime(df['Week End'])

    if data_up_to:
        if data_up_to < max(df["Week End"]):
            print("There is new crude runs data!")
        else:
            print("No new crude runs data")
    else:
        print("No local data...")


    df['% of capacity'] = [x/100 for x in df['% of capacity']]
    df['c'] = [r/p for r, p in zip(df['Runs for the week'],
                                   df['% of capacity'])]
    del df['% of capacity']
    df = df.rename(columns={"Region (english)": "r",
                            "Week End": "d",
                            "Runs for the week": "v",
                            "4 Week Average": "w",
                            "YTD Average": "t"})

    df = df.reset_index(drop=True)
    df["r"] = [x.strip() for x in df["r"]]
    df["r"] = df["r"].replace({"Ontario": "o",
                               "Quebec & Eastern Canada": "q",
                               "Western Canada": "w"})
    for val in ['v', 'w', 't', 'c']:
        df[val] = [x*6.2898 for x in df[val]]
        df[val] = df[val].round(1)
    # propbably dont need the 4week average and ytd average
    del df["w"]
    del df["t"]
    df = df.sort_values(by="d")
    df.to_json('runs.json', orient='records')

    meta = {}
    today = date.today()
    meta['updated'] = [today.year, today.month-1, today.day]
    with open('meta.json', 'w') as fp:
        json.dump(meta, fp)

    return df


if __name__ == "__main__":
    set_cwd_to_script()
    print('starting crude runs data update...')
    # links = orca_regdocs_links(True)
    df_ = get_data()
    print('completed data update!')
