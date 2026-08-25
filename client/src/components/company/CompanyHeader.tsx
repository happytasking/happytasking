import { MapPin } from "lucide-react";
import type { Company } from "../../types/company.types";
import { RatingStars } from "../common/RatingStars";
import { Button } from "../common/Button";

interface CompanyHeaderProps {
  company: Company;
  reviewCount: number;
  onAddReview: () => void;
}

const CompanyHeader = ({ company, onAddReview }: CompanyHeaderProps) => {
  return (
    <section className="rounded-xl bg-white px-8 py-6 transition-all duration-200 ">
      <div className="flex items-start justify-between">
        {/* Left */}
        <div className="flex items-start gap-5">
          <img
            src={company.logo}
            alt={company.name}
            className="h-24 w-24 rounded-lg object-cover"
          />

          <div>
            <h2 className="text-[1.25rem] font-semibold leading-none text-text-primary">
              {company.name}
            </h2>

            <div className="mt-2 flex items-center gap-2 text-[15px] text-text-secondary">
              <MapPin size={15} strokeWidth={2} />
              <span>{company.location}</span>
            </div>

            <div className="mt-5 flex items-center gap-4">
              <span className="text-md font-semibold text-text-primary">
                {company.rating.toFixed(1)}
              </span>

              <RatingStars rating={company.rating} />

              <span className="text-md font-medium text-text-primary">
                {company.reviewCount} Reviews
              </span>
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="flex min-h-24 flex-col items-end justify-between">
          <p className="text-sm text-text-secondary">
            Founded on{" "}
            {new Date(company.foundedOn).toLocaleDateString("en-GB")}{" "}
          </p>
          <Button onClick={onAddReview}>+ Add Review</Button>
        </div>
      </div>
    </section>
  );
};
export default CompanyHeader;
