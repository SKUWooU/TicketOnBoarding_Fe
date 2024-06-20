import axios from "axios";

const axiosBackend = axios.create({
  baseURL: import.meta.env.VITE_REACT_APP_AXIOS_BASE_URL,
});

export default axiosBackend;
