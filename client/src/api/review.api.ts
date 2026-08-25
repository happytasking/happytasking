import api from "./axios";

export const getReviews = (companyId: string) =>
  api.get(`/reviews/company/${companyId}`);

export const createReview = (data: unknown) => api.post("/reviews", data);

export const likeReview = (id: string) => api.patch(`/reviews/${id}/like`);
