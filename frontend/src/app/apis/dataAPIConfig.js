import axios from "axios"
import { DATA_API_BASE_URL } from "./url"
import { ACCESS_TOKEN } from "../CONSTANTS"
import { getAccessToken } from "./auth"


// defining a custom error handler for all APIs
const errorHandler =  async error => {
  const statusCode = error.response?.status

  // logging only errors that are not 401
  if (statusCode && statusCode !== 401) {
    console.error(error)
  } else {
    const originalRequest = error.config
    if (originalRequest._retry == true) {
      return Promise.reject(error)
    }
    originalRequest._retry = true
    console.log("or", originalRequest)
    await getAccessToken()

    //TODO: Call from generic function
    return (await createDataAPIRequestInstance()).request({
      method: originalRequest.method,
      url: originalRequest.url,
      data: originalRequest.data
    })
  }

  return Promise.reject(error)
}

const retriveAccessToken = async () => {
  if (typeof window === "undefined") {
    return null
  }
  let access_token = localStorage.getItem(ACCESS_TOKEN)
  if (!access_token) {
      await getAccessToken()
      access_token = localStorage.getItem(ACCESS_TOKEN)
  }
  return access_token
  
}
//TODO: Create a singleton object
export const createDataAPIRequestInstance = async () => {
  const access_token = await retriveAccessToken()
  console.log("token:",access_token)
  const dataApiInstance = axios.create({
    withCredentials: true,
    //TODO: Move to env
    baseURL: DATA_API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${access_token}` 
    }
  })

  // registering the custom error handler to the
  // "api" axios instance
  dataApiInstance.interceptors.response.use(({data}) => data, async (error) => {
    return await errorHandler(error)
  })
  return dataApiInstance
}