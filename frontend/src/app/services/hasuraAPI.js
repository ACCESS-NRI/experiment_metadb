import { createHasuraAPIRequestInstance } from "./apiConfig"
import { GET_EXPERIMENT_DATA, GET_EXPERIMENT_LIST, GET_MODEL_BUILD_LIST, SEARCH_EXPERIMENT } from "./url"

//TODO: Combine all the fetch functions in a single generic function with different arguments

export const fetchExperimentList = async () => {

    const api = await createHasuraAPIRequestInstance()

    //TODO: Call from generic function
    const res = await api.request({
        method: 'get',
        url: GET_EXPERIMENT_LIST,
    })
    return res
}

export const fetchExperimentData = async (experimentName) => {
    const api = await createHasuraAPIRequestInstance()

    return await api.request({
        method: 'get',
        url: GET_EXPERIMENT_DATA,
        params: {
            "name": experimentName
        }
    })
}

export const fetchSearchResult = async (searchText) => {
    const api = await createHasuraAPIRequestInstance()
    
    //TODO: Call from generic function
    return await api.request({
        method: 'get',
        url: SEARCH_EXPERIMENT,
        params: {
            "searchText": searchText
        }
    })
}

export const fetchModelBuildList = async (searchText) => {
    const api = await createHasuraAPIRequestInstance()
    
    //TODO: Call from generic function
    return await api.request({
        method: 'get',
        url: GET_MODEL_BUILD_LIST,
    })
}
