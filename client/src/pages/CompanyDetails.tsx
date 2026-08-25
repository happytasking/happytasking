import { useState } from "react";
import { useParams } from "react-router-dom";

import CompanyHeader from "../components/company/CompanyHeader";
import ReviewList from "../components/review/ReviewList";
import AddReviewModal from "../components/review/AddReviewModal";

import useCompany from "../hooks/useCompany";
import useReviews from "../hooks/useReviews";
import CompanyDetailsSkeleton from "../components/skeletons/CompanyDetailsSkeleton";

const CompanyDetails = () => {
  const { companyId } = useParams();
  const [isOpen, setIsOpen] = useState(false);

  const { company, loading, fetchCompany } = useCompany(companyId!);
  const { reviews, fetchReviews } = useReviews(companyId!);

  if (loading) {
    return <CompanyDetailsSkeleton />;
  }

  if (!company) {
    return (
      <div className="py-20 text-center">
        <h2 className="text-3xl font-semibold">Company not found</h2>
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto mt-10 max-w-5xl rounded-2xl bg-white p-5 shadow-[0_10px_40px_rgba(0,0,0,0.08)]">
        <CompanyHeader
          company={company}
          reviewCount={reviews.length}
          onAddReview={() => setIsOpen(true)}
        />

        <div className="my-5 border-b border-border" />

        <p className="text-sm mx-5 text-text-secondary">
          Result Found: {reviews.length}
        </p>

        <ReviewList reviews={reviews} onRefresh={fetchReviews} />
      </div>

      <AddReviewModal
        open={isOpen}
        companyId={companyId!}
        onClose={() => setIsOpen(false)}
        onSuccess={() => {
          fetchReviews();
          fetchCompany();
        }}
      />
    </>
  );
};

export default CompanyDetails;
