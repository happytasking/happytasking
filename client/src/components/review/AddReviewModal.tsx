import { useState } from "react";
import { useForm } from "react-hook-form";
import { Star, X } from "lucide-react";

import Modal from "../common/Modal";
import { Input } from "../common/Input";
import { Button } from "../common/Button";

import { createReview } from "../../api/review.api";

interface Props {
  open: boolean;
  companyId: string;
  onClose: () => void;
  onSuccess: () => void;
}

interface ReviewForm {
  fullName: string;
  subject: string;
  review: string;
  rating: number;
}

const AddReviewModal = ({ open, companyId, onClose, onSuccess }: Props) => {
  const [rating, setRating] = useState(0);
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<ReviewForm>();

  if (!open) return null;

  const onSubmit = async (data: ReviewForm) => {
    try {
      await createReview({
        ...data,
        company: companyId,
        rating: rating,
      });

      reset();

      onClose();

      onSuccess();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Modal isOpen={open} onClose={onClose} className="max-w-xl">
      <div className="relative overflow-hidden rounded-2xl bg-white px-8 py-10">
        {/* Decorations */}

        <div className="absolute -left-8 -top-8 z-20 h-28 w-28 rounded-full bg-gradient-to-br from-fuchsia-500 to-indigo-700"></div>

        <div className="absolute left-12 -top-8 z-10 h-24 w-24 rounded-full bg-violet-200"></div>

        {/* Close */}

        <button
          onClick={onClose}
          className="absolute right-6 top-6 cursor-pointer"
        >
          <X size={24} />
        </button>

        {/* Title */}

        <h2 className="mb-10 text-center text-2xl font-semibold">Add Review</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Input
            label="Full Name"
            placeholder="Enter"
            {...register("fullName", {
              required: true,
            })}
          />

          <Input
            label="Subject"
            placeholder="Enter"
            {...register("subject", {
              required: true,
            })}
          />

          <div>
            <label className="mb-2 block text-sm font-medium text-text-secondary">
              Enter your Review
            </label>

            <textarea
              rows={5}
              placeholder="Description"
              {...register("review", {
                required: true,
              })}
              className="
              w-full
              resize-none
              rounded-lg
              border
              border-border-subtle
              px-3
              py-3
              text-sm
              outline-none
              transition-colors
              focus:border-2
              focus:border-gray-700
          "
            />
          </div>

          {/* Rating */}

          <div className="pt-2">
            <h3 className="mb-4 text-lg font-semibold">Rating</h3>

            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="cursor-pointer"
                  >
                    <Star
                      size={32}
                      className={
                        star <= rating
                          ? "fill-[#F4B400] text-[#F4B400]"
                          : "fill-gray-300 text-gray-300"
                      }
                    />
                  </button>
                ))}
              </div>

              <span className="text-md text-gray-500">
                {rating >= 4
                  ? "Satisfied"
                  : rating >= 2
                    ? "Average"
                    : rating
                      ? "Unsatisfied"
                      : ""}
              </span>
            </div>
          </div>

          <div className="flex justify-center pt-3">
            <Button loading={isSubmitting} type="submit" className="min-w-36">
              Save
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default AddReviewModal;
