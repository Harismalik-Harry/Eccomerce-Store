import axios from 'axios';
export const axiosInstance=axios.create({
    baseURL: import.meta.env.MODE === 'development' ? 'http://localhost:5000/api' : 'https://your-production-url.com/api',
    withCredentials: true,
});


export default axiosInstance;