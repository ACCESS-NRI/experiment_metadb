## generate_variable_timeseries.py
A script that generates the list of groups of variables that appers together in the same timeperiod for a given experiment

```python3 generate_variable_timeseries.py experiment_name coordinate_variable_file output_filename```

where coordinate_variable_file is a json file which contains list of coordinate variables for each realm and experiment_name is the name of a experiment present in intake catalog.

## frontend
A next.js web app to display variable timeseries graphs

To host frontend on vercel:
1. Create a [vercel account](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) and connect this repo.
2. Navigate to the project in vercel dashboard and go to project setting
3. In root directory (under general menu) add 'frontend'.
4. In the git menu change the branch of deployment.
5. New commit will be deployed from this brach. To deploy current commit use [vercel-cli](https://vercel.com/docs/cli/deploying-from-cli)

## variable_info

Contains model and script to add variable details for an experiment. To add variable info for new experiment

```python3 save_exp_var.py experiment_name```

where experiment_name is the name of a experiment present in intake catalog.

## run_summary

Conatins model and script to add run_summay for through a yaml file