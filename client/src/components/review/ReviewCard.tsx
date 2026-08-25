import { ThumbsUp } from "lucide-react";
import type { Review } from "../../types/review.types";
import { RatingStars } from "../common/RatingStars";
import { likeReview } from "../../api/review.api";

interface Props {
  review: Review;
  onRefresh: () => void;
}

const ReviewCard = ({ review, onRefresh }: Props) => {
  const formattedDate = new Date(review.createdAt).toLocaleString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const handleLike = async () => {
    await likeReview(review._id);
    onRefresh();
  };
  return (
    <article className="mx-5 py-6">
      <div className="flex items-start gap-5">
        {/* Avatar */}
        <img
          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
            review.fullName,
          )}&background=random`}
          alt={review.fullName}
          className="h-14 w-14 shrink-0 rounded-full object-cover"
        />

        {/* Content */}
        <div className="flex-1">
          {/* Header */}
          <div className="flex items-start justify-between gap-8">
            <div>
              <h3 className="text-[1.3rem] font-semibold text-text-primary">
                {review.fullName}
              </h3>

              <p className="mt-1 text-[14px] text-text-secondary">
                {formattedDate}
              </p>
            </div>

            <RatingStars rating={review.rating} />
          </div>

          {/* Review */}
          <p className="mt-5 text-[1rem] leading-8 text-text-secondary">
            {review.review}
          </p>

          <div className="mt-6 flex items-center justify-between">
            <button
              onClick={handleLike}
              className="h-auto gap-2 cursor-pointer flex p-0 text-text-secondary hover:bg-transparent hover:text-text-primary"
            >
              <ThumbsUp size={18} />
              <span>{review.likes} Likes</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};

export default ReviewCard;
