//Services
export const MONGO = "mongo"
export const NECTAR = "nectar"

//Mongo token name
export const MONGO_ACCESS_TOKEN = "mongo_access_token"
export const MONGO_REFRESH_TOKEN = "mongo_refresh_token"
export const MONGO_AUTH_ACCESS_TOKEN_FIELD = "access_token"
export const MONGO_AUTH_REFRESH_TOKEN_FIELD = "refresh_token"

//Mongo DB fields name
export const COLLECTION = "collection"
export const DATA_SOURCE = "mongodb-atlas"
export const PBS_JOB = "pbs_job"
export const FILTER = "filter"
export const RUN_SUMMARY = "run_summary"
export const OID = "$oid"
export const WALLTIME_IN_HRS = "Walltime Used (hr)"
export const MEMEORY_USED_IN_GB = "Memory Used (Gb)"
export const STORAGE_IN_GB = "storage_in_gb"
export const END_DATE = "end_date"
export const START_DATE = "start_time"
export const SERVICE_UNITS = "Service Units"
export const RUN_LENGTH_DAYS = "run_length_in_days"
export const EXPERIMENT_UUID = "experiment_uuid"

//Nectar token name
export const NECTAR_TOKEN = "nectar_token"


//Experiment List
export const ACCESS_EXPERIMENTS = "Access Experiments"
export const EXPERIMENT_LIST_DESCRIPTION = `Selecting an experiment will show a description. Explore opens 
    a new browser window with more metadata and information for the selected experiment. \n\n Use search to 
    limit experiments. Search is on model, description and keywords. By default multiple search terms reduces 
    the number of experiments shown (AND), but this can be changed to increase matches (OR)`

//Data Timeline
export const DATA_TIMELINE_DESCRIPTION = `Explore variables in an experiment: at what frequency and over what 
temporal range they are available.\n\n

Choose a model realm and frequency and the available variables will be plotted on the timeline. The background 
Selecting a variable shows the variable description in the Deselect the check box to in the variable chooser to 
remove a variable from the plot.\n\n

The search function matches variable name, standard name and long name. When specifying multiple search terms 
the default is to narrow down the search with multiple terms (AND), but you can toggle and make the search show 
more results for (OR).`

//Common display text
export const SEARCH_TEXT = "SEARCH"
export const EXPERIMENT_TEXT = "Experiment"
export const EXPLORE_TEXT = "Explore"