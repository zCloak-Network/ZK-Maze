import instance, { CHAIN_SERVICE } from "./axiosInstance";

export const upload = (params: FormData) => {
  return instance.post(`/api/s3/upload`, params, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const getMap = () => {
  return instance.get(`/api/zkmaze/generate`);
};

export const getETH = (params: { ethAddress: `0x${string}` }) => {
  return instance.post(`/sendEth`, params, {
    baseURL: CHAIN_SERVICE,
  });
};
