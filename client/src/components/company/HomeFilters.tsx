import { ChevronDown, MapPin, Plus, Search } from "lucide-react";
import { Input } from "../common/Input";
import { Button } from "../common/Button";

interface HomeFiltersProps {
  search: string;
  setSearch: React.Dispatch<React.SetStateAction<string>>;

  sort: string;
  setSort: React.Dispatch<React.SetStateAction<string>>;

  onAddCompany: () => void;
}

const HomeFilters = ({
  search,
  setSearch,
  sort,
  setSort,
  onAddCompany,
}: HomeFiltersProps) => {
  return (
    <section className="mt-2 space-y-10 border-b border-b-border flex flex-wrap items-start justify-between gap-6">
      <div className="flex justify-center items-end gap-4 mx-10">
        {/* City */}

        <div className="w-80">
          <label className="mb-2 block text-sm font-medium text-gray-600">
            Search City
          </label>

          <div className="relative">
            <Input
              isSearch={true}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pr-9"
            />

            <MapPin
              size={18}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-violet-600"
            />
          </div>
        </div>

        {/* Find */}
        <Button className="gap-2">
          <Search size={18} />

          <span>Find Company</span>
        </Button>
        <Button onClick={onAddCompany} className="gap-2">
          <Plus size={18} />

          <span>Add Company</span>
        </Button>
      </div>

      <div className="mx-10">
        <label className="mb-2 block text-sm font-medium text-gray-600">
          Sort
        </label>

        <div className="relative ">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="h-10 w-40 appearance-none cursor-pointer rounded-lg border border-gray-300 bg-white px-4 pr-10 text-[.9rem] font-medium outline-none"
          >
            <option value="createdAt">Newest</option>
            <option value="name">Name</option>
            <option value="rating">Rating</option>
          </select>

          <ChevronDown
            size={18}
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
          />
        </div>
      </div>
    </section>
  );
};

export default HomeFilters;
