import axios from "axios";

const axiosBackend = axios.create({
  baseURL: import.meta.env.VITE_REACT_APP_AXIOS_BASE_URL || "/api",
});

export default axiosBackend;
