## Data table visualization and export without metrics for Kibana 6.x

> A kibana plugin that will allow us to build a custom table without metrics from the data stored in the ES indexes. It will show all the stored indexes in the ES instance, then all the present columns in the index to build the custom table. Then we will be able to export the table we had built as CSV

## Features

* Show all indexes stored in the ES(ElasticSearch) instance
* Show all columns present in the selectionned index
* Build own custom datatable from chosen index and columns with dynamic number of hits
* Export custom builded datatable as CSV

## Installation


## development

Clone this repo in the same repo where you have kibana stored

See the [kibana contributing guide](https://github.com/elastic/kibana/blob/master/CONTRIBUTING.md) for instructions setting up your development environment. Once you have completed that, use the following npm tasks.

  - `npm start`

    Start kibana and have it include this plugin

  - `npm start -- --config kibana.yml`

    You can pass any argument that you would normally send to `bin/kibana` by putting them after `--` when running `npm start`

  - `npm run build`

    Build a distributable archive

  - `npm run test:browser`

    Run the browser tests in a real web browser

  - `npm run test:server`

    Run the server tests using mocha

For more information about any of these commands run `npm run ${task} -- --help`.
