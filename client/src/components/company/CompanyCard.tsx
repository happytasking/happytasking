import { MapPin } from "lucide-react";
import { Link } from "react-router-dom";

import type { Company } from "../../types/company.types";
import { RatingStars } from "../common/RatingStars";

interface CompanyCardProps {
  company: Company;
}

const CompanyCard = ({ company }: CompanyCardProps) => {
  const formattedDate = new Date(company.foundedOn).toLocaleDateString("en-GB");

  return (
    <article className="rounded-xl bg-white px-8 py-6 shadow-sm transition-all duration-200 hover:shadow-[0_10px_35px_rgba(0,0,0,0.08)]">
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
          <p className="text-sm text-[#8A8A8A]">Founded on {formattedDate}</p>

          <Link
            to={`/company/${company._id}`}
            className="rounded-md bg-[#2F2F2F] px-8 py-2 text-base font-medium text-white transition hover:bg-black text-[.9rem]"
          >
            Detail Review
          </Link>
        </div>
      </div>
    </article>
  );
};

export default CompanyCard;
