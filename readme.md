# crude-runs

- Production dashboard: https://www.cer-rec.gc.ca/en/data-analysis/energy-commodities/crude-oil-petroleum-products/statistics/weekly-crude-run-summary-data.html
- Azure Static WebApp: https://nice-coast-04d108410.azurestaticapps.net/

Updated on the CER website monthly.

## Instructions for monthly data update

As of November 2021, the data has been removed from the webpack pattern and moved to Azure blob storage, with fallback to a webpack dynamic import of an older data bundle.

Blob endpoint: https://cer-production.azureedge.net/crude-run-data/runs.json

`src/data_management/prepare_data.py` can be run monthly and will update the blob + local data file (`src/data_management/runs.json`) if there is new data on the CER website.

## Instructions for css/js/html update

1. Download and save the latest release dist.zip from GitHub: https://github.com/mbradds/crude-runs/releases

2. Unzip this folder inside of whatever VM or system that has access to dweb7 (data-analysis-dev).
   You will need to copy files from `/dist` the english and french dweb7 locations:

- eng: `/energy-commodities/crude-oil-petroleum-products/statistics`
- fra: `/produits-base-energetiques/petrole-brut-produits-petroliers/statistiques`

3. At the eng & fra locations specified above, replace the following old files with the updated files in `/dist`

- css: main.[contenthash].css
- vendor js: `/vendor/highcharts.[contenthash].js`
- JavaScript: en.[contenthash].js (for english) & fr.[contenthash].js

The old files with the outdated content hash should be deleted from dweb7 at this point.

4. Update the HTML script tags

These instructions are for English, but the French instructions will be the same for the French file locations.

Inside `weekly-crude-run-summary-data.html` the script tags need to be updated to accomodate the new content hashes:

```diff
<head>
  <!-- InstanceBeginEditable name="doctitle" -->
  <title>CER – Weekly Crude Run Summary and Data</title>
  <!-- InstanceEndEditable -->
  <!-- Meta data -->
  <!-- InstanceBeginEditable name="head" -->
- <link href="css/main.OLDCONTENTHASH.css" rel="stylesheet" />
- <script defer="defer" src="vendor/highcharts.OLDCONTENTHASH.js"></script>
- <script defer="defer" src="en.OLDCONTENTHASH.js"></script>
+ <link href="css/main.NEWCONTENTHASH.css" rel="stylesheet" />
+ <script defer="defer" src="vendor/highcharts.NEWCONTENTHASH.js"></script>
+ <script defer="defer" src="en.NEWCONTENTHASH.js"></script>
</head>
```

5. Update the dashboard HTML

These instructions are for English, but the French instructions will be the same for the French file locations.

`/dist/index_en.html` contains new HTML for the crude-runs dashboard. The old HTML can be deleted and replaced with the new HTML. Only the html specific to the dashboard should be deleted and replaced (everything in between the start and end dashboard comments, approximately line 34-121 in `/dist/index_en.html`)

```diff
<!-- start crude runs dashboard -->
-<div class="row mrgn-tp-lg" id="runs-intro">
- <html content here>
-</div>
-<div class="row">
-  <html content here>
-</div>
<!-- end crude runs dashboard -->

<!-- start crude runs dashboard -->
+<div class="row mrgn-tp-lg" id="runs-intro">
+ <html content here>
+</div>
+<div class="row">
+  <html content here>
+</div>
<!-- end crude runs dashboard -->
```

6. Publish to tweb and send the links to grant.moss@cer-rec.gc.ca
