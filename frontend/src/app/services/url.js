//TODO: Move auth and baseURL to env
export const MONGO_AUTH = "https://ap-southeast-2.aws.realm.mongodb.com/api/client/v2.0/app/application-0-uarzy/auth/providers/anon-user/login"
export const  DATA_API_BASE_URL = "https://ap-southeast-2.aws.data.mongodb-api.com/app/application-0-uarzy/endpoint/data/v1/action"

export const FIND_ACTION = "/find"

//Nectar
export const NECTAR_AUTH = "https://keystone.rc.nectar.org.au:5000/v3/auth/tokens"
export const NECTOR_OBJECT_STORE = "https://object-store.rc.nectar.org.au/v1/AUTH_685340a8089a4923a71222ce93d5d323/experiment-variable-timeline/"

//Hausra
export const HASURA_BASE_URL = "https://sincere-slug-43.hasura.app/api/rest"
export const GET_EXPERIMENT_LIST = "/get-experiment-list"
export const GET_EXPERIMENT_DATA = "/get-experiment-by-name"
export const SEARCH_EXPERIMENT = "/search-experiment"