import axios from "axios";
import { BASE_API_HOST } from "../constants";
import { HOST_VARIANTS } from "../types";

const $baseReq = (types: HOST_VARIANTS = HOST_VARIANTS.Default) => {
  const config = axios.create({
    baseURL:
      types === HOST_VARIANTS.Default ? BASE_API_HOST + "/v1" : BASE_API_HOST,
  });

  return config;
};

const $authReq = (types: HOST_VARIANTS = HOST_VARIANTS.Default) => {
  const config = axios.create({
    baseURL:
      types === HOST_VARIANTS.Default ? BASE_API_HOST + "/v1" : BASE_API_HOST,
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
