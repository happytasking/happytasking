import { useEffect, useState } from "react";

import HomeFilters from "../components/company/HomeFilters";
import CompanyList from "../components/company/CompanyList";
import AddCompanyModal from "../components/company/AddCompanyModal";

import useCompanies from "../hooks/useCompanies";
import CompanyListSkeleton from "../components/skeletons/CompanyListSkeleton";

const Home = () => {
  const { companies, loading, fetchCompanies } = useCompanies();

  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("createdAt");

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchCompanies(search, sort);
    }, 400);

    return () => clearTimeout(timeout);
  }, [search, sort]);

  return (
    <>
      <HomeFilters
        search={search}
        setSearch={setSearch}
        sort={sort}
        setSort={setSort}
        onAddCompany={() => setIsOpen(true)}
      />

      {loading ? (
        <CompanyListSkeleton />
      ) : (
        <CompanyList companies={companies} />
      )}

      <AddCompanyModal
        open={isOpen}
        onClose={() => setIsOpen(false)}
        onSuccess={fetchCompanies}
      />
    </>
  );
};

export default Home;
