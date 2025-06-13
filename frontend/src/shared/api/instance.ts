import axios from "axios";
import { BASE_API_HOST, HOST_VARIANTS } from "../constants";

const $baseReq = (types: HOST_VARIANTS = HOST_VARIANTS.Default) => {
  const config = axios.create({
    baseURL:
      types === HOST_VARIANTS.Default ? BASE_API_HOST + "/api" : BASE_API_HOST,
  });

  return config;
};

const $authReq = (types: HOST_VARIANTS = HOST_VARIANTS.Default) => {
  const config = axios.create({
    baseURL:
      types === HOST_VARIANTS.Default ? BASE_API_HOST + "/api" : BASE_API_HOST,
  });

  config.interceptors.request.use((config) => {
    const token = "mock";

    if (!config.headers.Authorization)
      config.headers.Authorization = `Bearer ${token}`;

    return config;
  });

  return config;
};

export { $baseReq, $authReq };
