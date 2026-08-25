import { useEffect, useState } from "react";
import { getCompanyById } from "../api/company.api";
import type { Company } from "../types/company.types";

const useCompany = (companyId: string) => {
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchCompany = async () => {
    try {
      setLoading(true);

      const { data } = await getCompanyById(companyId);

      setCompany(data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (companyId) {
      fetchCompany();
    }
  }, [companyId]);

  return {
    company,
    loading,
    fetchCompany,
  };
};

export default useCompany;
