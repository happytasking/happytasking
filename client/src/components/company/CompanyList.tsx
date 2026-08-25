import type { Company } from "../../types/company.types";
import CompanyCard from "./CompanyCard";

interface CompanyListProps {
  companies: Company[];
}

const CompanyList = ({ companies }: CompanyListProps) => {
  if (companies.length === 0) {
    return (
      <div className="py-20 text-center text-text-secondary">
        No companies found.
      </div>
    );
  }

  return (
    <div className="space-y-6 mt-10">
      <span className="text-text-secondary font-medium text-[0.85rem]">
        Found {companies.length}
      </span>
      <div className="mt-2 flex flex-col gap-8">
        {companies.map((company) => (
          <CompanyCard key={company._id} company={company} />
        ))}
      </div>
    </div>
  );
};

export default CompanyList;
