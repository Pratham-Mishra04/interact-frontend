import Toaster from '@/utils/toaster';
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { CacheAxiosResponse, setupCache } from 'axios-cache-interceptor';
import Cookies from 'js-cookie';
import { TOKEN_EXPIRATION_ERROR, VERIFICATION_ERROR } from './errors';
import { BACKEND_URL } from './routes';

interface MyAxiosRequestConfig extends AxiosRequestConfig {
  _retry?: boolean;
}

interface RefreshError extends Omit<AxiosError, 'response'> {
  response?: AxiosResponse<{ message: string }>;
}

// Initialize Axios instance and wrap it with axios-cache-interceptor
const configuredAxios = setupCache(
  axios.create({
    baseURL: BACKEND_URL,
  }),
  {
    ttl: 1 * 60 * 1000, // Default cache time-to-live (1 minute)
  }
);

let isRefreshing = false; // Flag to track if a refresh request is ongoing
let refreshSubscribers: ((token: string) => void)[] = []; // Array to hold the pending requests while token is being refreshed

function subscribeTokenRefresh(callback: (token: string) => void) {
  refreshSubscribers.push(callback);
}

function onTokenRefreshed(newToken: string) {
  refreshSubscribers.forEach(callback => callback(newToken));
  refreshSubscribers = [];
}

configuredAxios.interceptors.request.use(
  config => {
    const token = Cookies.get('token');
    if (token && token !== '') {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

configuredAxios.interceptors.response.use(
  (response: CacheAxiosResponse) => {
    if (response.data.message === VERIFICATION_ERROR) {
      Toaster.error(VERIFICATION_ERROR);
      window.location.replace('/verification');
    }
    return response;
  },
  (error: AxiosError) => Promise.reject(error)
);

configuredAxios.interceptors.response.use(
  (response: CacheAxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as MyAxiosRequestConfig;
    if (error.response && error.response.status === 403 && !originalRequest._retry) {
      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const refreshResponse = await axios.post(
            `${BACKEND_URL}/refresh`,
            { token: Cookies.get('token') },
            { withCredentials: true }
          );

          const newAccessToken = refreshResponse.data.token;
          Cookies.set('token', newAccessToken, {
            expires: Number(process.env.NEXT_PUBLIC_COOKIE_EXPIRATION_TIME),
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
          });

          onTokenRefreshed(newAccessToken);

          originalRequest.headers!.Authorization = `Bearer ${newAccessToken}`;
          originalRequest._retry = true;

          return configuredAxios(originalRequest);
        } catch (refreshError) {
          const errorResponse = refreshError as RefreshError;
          if (errorResponse.response?.data?.message == TOKEN_EXPIRATION_ERROR) {
            Toaster.error('Session Expired, Log in again');
            refreshSubscribers = [];
            Cookies.remove('token');
            window.location.replace('/login');
          }
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      } else {
        return new Promise(resolve => {
          subscribeTokenRefresh(newToken => {
            originalRequest.headers!.Authorization = `Bearer ${newToken}`;
            originalRequest._retry = true;
            resolve(configuredAxios(originalRequest));
          });
        });
      }
    }
    return Promise.reject(error);
  }
);

export default configuredAxios;
