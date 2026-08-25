import { useState } from "react";
import { getCompanies } from "../api/company.api";
import type { Company } from "../types/company.types";

const useCompanies = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);

  const fetchCompanies = async (search = "", sort = "createdAt") => {
    try {
      companies.length === 0 ? setLoading(true) : setFetching(true);

      const { data } = await getCompanies({ search, sort });
      setCompanies(data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setFetching(false);
    }
  };

  return { companies, loading, fetching, fetchCompanies };
};

export default useCompanies;
