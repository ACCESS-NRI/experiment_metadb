import { COLLECTION, DATA_SOURCE, FILTER, OID, PBS_JOB, RUN_SUMMARY } from "../CONSTANTS"
import { createDataAPIRequestInstance } from "./dataAPIConfig"
import { FIND_ACTION } from "./url"

const body = {
    "dataSource": DATA_SOURCE,

    //TODO: MOVE to env
    "database": "EXPERIMENTS",
}

export const getRunSummaryJobData = async (runSummaryId) => {
    body[COLLECTION] = PBS_JOB
    body[FILTER] = {
        [RUN_SUMMARY] : {
            [OID]: runSummaryId
        }
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
