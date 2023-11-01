import axios from "axios"
import { AUTH } from "./url"
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../CONSTANTS"

export const getAccessToken = async () => {
    const response = await axios.post(AUTH)
    saveAuthToken(response.data)
    return response.data
}

const saveAuthToken = (data) => {
    localStorage.setItem(ACCESS_TOKEN, data[ACCESS_TOKEN])
    localStorage.setItem(REFRESH_TOKEN, data[REFRESH_TOKEN])
}