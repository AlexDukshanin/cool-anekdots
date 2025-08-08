const useAuthFetch = () => {
  const refreshAccessToken = async () => {
    const refresh = localStorage.getItem('refresh');
    if (!refresh) return null;

    const response = await fetch('http://localhost:8000/api/token/refresh/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh }),
    });

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('access', data.access);
      return data.access;
    } else {
      localStorage.removeItem('access');
      localStorage.removeItem('refresh');
      window.location.href = '/login';
      return null;
    }
  };

  const authFetch = async (url, options = {}) => {
    let token = localStorage.getItem('access');

    const addAuthHeader = (opts) => {
      
      const isFormData = opts.body instanceof FormData;

      return {
        ...opts,
        headers: {
          ...(opts.headers || {}),
          Authorization: `Bearer ${token}`,
          ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        },
      };
    };

    let response = await fetch(url, addAuthHeader(options));

    if (response.status === 401) {
      token = await refreshAccessToken();
      if (!token) return null;

      response = await fetch(url, addAuthHeader(options));
    }

    return response;
  };

  return authFetch;
};

export default useAuthFetch;