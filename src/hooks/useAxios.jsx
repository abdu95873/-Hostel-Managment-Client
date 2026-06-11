import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5001";

const axiosInstance = axios.create({ baseURL });

const useAxios = () => axiosInstance;

export default useAxios;
