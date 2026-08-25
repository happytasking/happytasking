import api from "./axios";

export const getCompanies = (params?: {
  search?: string;
  city?: string;
  sort?: string;
}) => api.get("/companies", { params });

export const getCompanyById = (id: string) => api.get(`/companies/${id}`);

export const createCompany = (data: unknown) => api.post("/companies", data);
