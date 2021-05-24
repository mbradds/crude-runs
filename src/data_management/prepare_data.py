import pandas as pd
import os
import ssl
ssl._create_default_https_context = ssl._create_unverified_context
script_dir = os.path.dirname(__file__)


def get_data():
    link = "https://www.cer-rec.gc.ca/en/data-analysis/energy-commodities/crude-oil-petroleum-products/statistics/crdrn-hstrcl.xlsx"
    df = pd.read_excel(link, engine="openpyxl")
    cols = list(df.columns)
    df = df[~df[cols[1]].isnull()]
    new_header = [str(x) for x in list(df.iloc[0])]
    new_header = [x.split("/")[0].strip() for x in new_header]
    df = df[1:]
    df.columns = new_header
    for col in df.columns:
        if col == "nan" or col == "NaT":
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

    return df


if __name__ == "__main__":
    print('starting crude runs data update...')
    # links = orca_regdocs_links(True)
    df = get_data()
    print('completed data update!')