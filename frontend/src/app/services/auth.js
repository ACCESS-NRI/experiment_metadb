import axios from "axios"
import { 
    MONGO, 
    MONGO_ACCESS_TOKEN, 
    MONGO_AUTH_ACCESS_TOKEN_FIELD, 
    MONGO_AUTH_REFRESH_TOKEN_FIELD, 
    MONGO_REFRESH_TOKEN, NECTAR, 
    NECTAR_TOKEN } from "../CONSTANTS"

export const getAccessToken = async (authURL, service, body) => {
    const response = await axios.post(authURL, body, { withCredentials: true })
    saveAuthToken(response, service)
    return response.data
}

const saveAuthToken = (response, service) => {
    if (service === MONGO) {
        localStorage.setItem(MONGO_ACCESS_TOKEN, response.data[MONGO_AUTH_ACCESS_TOKEN_FIELD])
        localStorage.setItem(MONGO_REFRESH_TOKEN, response.data[MONGO_AUTH_REFRESH_TOKEN_FIELD])
    }

    if (service === NECTAR) {
        localStorage.setItem(NECTAR_TOKEN, response)
    }
}