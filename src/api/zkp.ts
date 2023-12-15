import instance from "./axiosInstance";

export const upload = (params: FormData) => {
  return instance.post(`/api/s3/upload`, params, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};
