import type { Review } from "../../types/review.types";
import ReviewCardSkeleton from "../skeletons/ReviewCardSkeleton";
import ReviewCard from "./ReviewCard";

interface Props {
  reviews: Review[];
  onRefresh: () => void;
  isLoading?: boolean;
}

const ReviewList = ({ reviews, onRefresh, isLoading = false }: Props) => {
  if (isLoading) {
    return (
      <div className="space-y-5">
        {Array.from({ length: 3 }).map((_, i) => (
          <ReviewCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!reviews.length) {
    return (
      <div className="py-16 text-center text-text-secondary">
        No reviews yet.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {reviews.map((review) => (
        <ReviewCard key={review._id} review={review} onRefresh={onRefresh} />
      ))}
    </div>
  );
};

export default ReviewList;
