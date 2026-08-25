import { useEffect, useState } from "react";
import { getReviews } from "../api/review.api";
import type { Review } from "../types/review.types";

const useReviews = (companyId: string) => {
  const [reviews, setReviews] = useState<Review[]>([]);

  const fetchReviews = async () => {
    try {
      const { data } = await getReviews(companyId);

      setReviews(data.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (companyId) {
      fetchReviews();
    }
  }, [companyId]);

  return {
    reviews,
    fetchReviews,
  };
};

export default useReviews;
