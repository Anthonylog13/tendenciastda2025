import axios from 'axios';

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (const element of cookies) {
            const cookie = element.trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

export const API_URL = "https://backend-pedidos.fly.dev";

const axiosInstance = axios.create({
  baseURL: API_URL,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem('user'));

    if (user && user.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }

    config.headers['X-CSRFToken'] = getCookie('csrftoken');

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const user = JSON.parse(localStorage.getItem('user'));

        if (user && user.refreshToken) {
          const response = await axios.post(`${API_URL}/api/token/refresh/`, {
            refresh: user.refreshToken
          });

          if (response.data.access) {
            user.token = response.data.access;
            localStorage.setItem('user', JSON.stringify(user));

            originalRequest.headers.Authorization = `Bearer ${response.data.access}`;

            return axiosInstance(originalRequest);
          }
        }
      } catch (refreshError) {
        console.error('Error al actualizar el token:', refreshError);
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
