import { COLLECTION, DATA_SOURCE, FILTER, PBS_JOB, RUN_SUMMARY } from "../CONSTANTS"
import { createDataAPIRequestInstance } from "./apiConfig"
import { FIND_ACTION } from "./url"

const body = {
    "dataSource": DATA_SOURCE,

    //TODO: MOVE to env
    "database": "EXPERIMENTS",
}

export const fetchRunSummaryJobData = async (expUUID) => {
    body[COLLECTION] = PBS_JOB
    body[FILTER] = {
            [RUN_SUMMARY] : expUUID
    }
    
    const api = await createDataAPIRequestInstance()

    //TODO: Call from generic function
    const res = await api.request({
        method: 'post',
        url: FIND_ACTION,
        data: JSON.stringify(body)
    })
    return res
}
