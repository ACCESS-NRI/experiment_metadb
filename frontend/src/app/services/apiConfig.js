import axios from "axios"
import { DATA_API_BASE_URL, HASURA_BASE_URL, MONGO_AUTH, NECTAR_AUTH, NECTOR_OBJECT_STORE } from "./url"
import { MONGO, MONGO_ACCESS_TOKEN, NECTAR, NECTAR_TOKEN } from "../CONSTANTS"
import { getAccessToken } from "./auth"


const createAxiosRequest = (baseURL) => {
    return axios.create({
                withCredentials: true,
                baseURL: baseURL,
                headers: {
                    'Content-Type': 'application/json'
                }
            })
}

// defining a custom error handler for all APIs
const errorHandler =  async (error, service) => {
  const statusCode = error.response?.status

  // logging only errors that are not 401
  if (statusCode && statusCode !== 401) {
    console.error(error)
  } else {
    const originalRequest = error.config
    if (originalRequest._retry == true) {
      return Promise.reject(error)
    }
    await getAccessToken(MONGO_AUTH, MONGO)

    //TODO: Call from generic function
    let apiRequest;
    
    if (service === MONGO) {
        apiRequest = await createDataAPIRequestInstance()
    } else if (service === NECTAR) {
        apiRequest = await createNectarObjectStoreAPIRequestInstance()
    }

    return apiRequest.request({
      method: originalRequest.method,
      url: originalRequest.url,
      data: originalRequest.data,
      _retry:  true
    })
  }

  return Promise.reject(error)
}

const retriveAccessToken = async (service) => {
  if (typeof window === "undefined") {
    return null
  }

  let access_token;

  if (service === MONGO) {
    access_token = localStorage.getItem(MONGO_ACCESS_TOKEN)
    if (!access_token) {
        await getAccessToken(MONGO_AUTH, MONGO)
        access_token = localStorage.getItem(MONGO_ACCESS_TOKEN)
    }
  } else if (service === NECTAR) {
    let access_token = localStorage.getItem(NECTAR_TOKEN)
    if (!access_token) {
      //TODO: Move credientials to env!!!
        const body = { "auth": {
          "identity": {
            "methods": ["password"],
            "password": {
              "user": {
                "name": "",
                "domain": { "id": "default" },
                "password": ""
              }
            }
          },
          "scope": {
              "project": {
                  "id": "685340a8089a4923a71222ce93d5d323"
              }
          }
        }
      }
      await getAccessToken(NECTAR_AUTH, NECTAR, JSON.stringify(body))
      access_token = localStorage.getItem(NECTAR_TOKEN)
    }
  }
  return access_token  
}

//TODO: Create a singleton object
export const createDataAPIRequestInstance = async () => {
  const access_token = await retriveAccessToken(MONGO)
  const dataApiInstance = createAxiosRequest(DATA_API_BASE_URL)

  dataApiInstance.interceptors.request.use(config => {
      config.headers['Authorization'] = `Bearer ${access_token}`
          return config;
      }
  )

  // registering the custom error handler to the
  // "api" axios instance
  dataApiInstance.interceptors.response.use(({data}) => data, async (error) => {
    return await errorHandler(error, MONGO)
  })
  return dataApiInstance
}

export const createHasuraAPIRequestInstance = async () => {
    const apiInstance = createAxiosRequest(HASURA_BASE_URL)

    apiInstance.interceptors.response.use(({data}) => data, async (error) => {
        return await errorHandler(error)
    })

    return apiInstance
}

// export const createNectarObjectStoreAPIRequestInstance = async () => {
//   const access_token = await retriveAccessToken(NECTAR)
//   const apiInstance = axios.create({
//     withCredentials: true,
//     baseURL: NECTOR_OBJECT_STORE,
//     headers: {
//       'Content-Type': 'application/json',
//       'X-Auth-Token': `Bearer ${access_token}` 
//     }
//   })

//   // registering the custom error handler to the
//   // "api" axios instance
//   apiInstance.interceptors.response.use(({data}) => data, async (error) => {
//     return await errorHandler(error, NECTAR)
//   })
//   return apiInstance
// }