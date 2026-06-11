import axios from "axios";
import { useEffect } from "react";
import useAuth from "./useAuth";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5001";

const axiosSecure = axios.create({ baseURL });

const useAxiosSecure = () => {
  const { user } = useAuth();

  useEffect(() => {
    const interceptor = axiosSecure.interceptors.request.use(
      (config) => {
        if (user?.accessToken) {
          config.headers.Authorization = `Bearer ${user.accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    return () => axiosSecure.interceptors.request.eject(interceptor);
  }, [user]);

  return axiosSecure;
};

export default useAxiosSecure;
