import configuredAxios from '@/config/axios';
import { GenericAbortSignal } from 'axios';

const getHandler = async (URL: string, signal?: GenericAbortSignal, cache = false) => {
  const headers = {
    'Content-Type': 'application/json',
  };

  const response: any = {
    status: 0,
    data: '',
    statusCode: 500,
  };
  await configuredAxios
    .get(URL, { headers, signal, cache: cache ? { ttl: 3 * 60 * 1000 } : false })
    .then(res => {
      response.status = 1;
      response.data = res.data;
      response.statusCode = res.status;
    })
    .catch(err => {
      if (err.name == 'CanceledError') response.status = -1;
      else response.status = 0;
      response.data = err.response?.data || '';
      response.statusCode = 500;
    });
  return response;
};

export default getHandler;
