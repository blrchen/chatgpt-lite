import axios, { AxiosError } from 'axios'
import type { AxiosRequestConfig, AxiosInstance, AxiosResponse } from 'axios'

class HttpRequest {
  baseURL = '/'

  async setInstancetors(instance: AxiosInstance) {
    // const token = await getIdToken(msalInstance)

    // instance.interceptors.request.use((config) => {
    //   config.headers = {
    //     Authorization: `Bearer ${token}`,
    //     'Content-Type': 'application/json',
    //     ...config.headers
    //   }
    //   return config
    // })

    instance.interceptors.response.use(
      (res: AxiosResponse) => {
        const { status, data } = res
        if (status === 200) {
          return Promise.resolve(data)
        } else {
          return Promise.reject(data)
        }
      },
      (error: AxiosError) => {
        const status = error.response?.status
        switch (status) {
          case 401:
            break
        }
        return Promise.reject(error)
      }
    )
  }

  mergeOptions(options: AxiosRequestConfig) {
    return {
      baseURL: this.baseURL,
      ...options
    }
  }

  request<T = any, R = any>(config: AxiosRequestConfig) {
    const instance = axios.create()
    this.setInstancetors(instance)
    const opts = this.mergeOptions(config)
    return instance<T, R>(opts)
  }

  get<T = any, R = any>(url: string, params?: any, config: AxiosRequestConfig = {}) {
    return this.request<T, R>({
      method: 'get',
      url,
      params,
      ...config
    })
  }

  post<T = any, R = any>(url: string, data?: any, config: AxiosRequestConfig = {}) {
    return this.request<T, R>({
      method: 'post',
      url,
      data,
      ...config
    })
  }

  put<T = any, R = any>(url: string, data?: any, config: AxiosRequestConfig = {}) {
    return this.request<T, R>({
      url,
      data,
      method: 'PUT',
      ...config
    })
  }

  delete<T = any, R = any>(url: string, params?: any, config: AxiosRequestConfig = {}) {
    return this.request<T, R>({
      url,
      params,
      method: 'DELETE',
      ...config
    })
  }
}

export default new HttpRequest()
