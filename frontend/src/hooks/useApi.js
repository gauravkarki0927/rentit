import { useState, useCallback } from 'react';
import axios from 'axios';
import { handleApiError } from '../utils/helpers';

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const request = useCallback(async (method, url, data = null) => {
    try {
      setLoading(true);
      setError(null);

      const config = {
        method,
        url,
      };

      if (data) {
        config.data = data;
      }

      const response = await axios(config);
      return { data: response.data, error: null };
    } catch (err) {
      const errorObj = handleApiError(err);
      setError(errorObj.message);
      return { data: null, error: errorObj };
    } finally {
      setLoading(false);
    }
  }, []);

  const get = useCallback((url) => request('GET', url), [request]);
  const post = useCallback((url, data) => request('POST', url, data), [request]);
  const put = useCallback((url, data) => request('PUT', url, data), [request]);
  const patch = useCallback((url, data) => request('PATCH', url, data), [request]);
  const del = useCallback((url) => request('DELETE', url), [request]);

  return {
    loading,
    error,
    request,
    get,
    post,
    put,
    patch,
    delete: del,
  };
};
