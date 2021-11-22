import os
import ssl
from datetime import date
import json
import pandas as pd
from azure.storage.blob import BlobServiceClient, BlobClient, ContainerClient
from azure.core.exceptions import ResourceExistsError
ssl._create_default_https_context = ssl._create_unverified_context


def set_cwd_to_script():
    dname = os.path.dirname(os.path.abspath(__file__))
    os.chdir(dname)


def upload_crude_run_blob(file_name, container_name="crude-run-data"):
    key = json.load(open("AZURE_STORAGE_CONNECTION_STRING.json"))
    connect_str = key["AZURE_STORAGE_CONNECTION_STRING"]
    blob_service_client = BlobServiceClient.from_connection_string(connect_str)
    try:
        container_client = blob_service_client.create_container(container_name)
    except ResourceExistsError:
        container_client = blob_service_client.get_container_client(container_name)

    print("starting blob upload...")
    with open("./"+file_name, "rb") as data:
        blob_client = container_client.upload_blob(name=file_name, data=data, overwrite=True)
    print("completed blob upload")
    return connect_str


def get_data(file_name):
    # get the existing local data for last date comparison
    if os.path.isfile("./"+file_name):
        current = json.load(open(file_name))
        current = pd.read_json(current["data"], convert_dates=["d"])
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
            upload_blob = True
            print("There is new crude runs data!")
        else:
            upload_blob = False
            print("No new crude runs data")
    else:
        upload_blob = True
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

    today = date.today()
    blob = {"data": df.to_json(orient="records"),
            "updated": [today.year, today.month-1, today.day]}

    with open(file_name, 'w') as fp:
        json.dump(blob, fp)

    if upload_blob:
        upload_crude_run_blob(file_name)


if __name__ == "__main__":
    file_name = "runs.json"
    set_cwd_to_script()
    print('starting crude runs data update...')
    # key = upload_crude_run_blob()
    df_ = get_data(file_name)
    print('completed data update!')
