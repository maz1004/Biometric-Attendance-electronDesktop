import React from "react";
import { useSearchParams } from "react-router-dom";
import Select, { SelectOption } from "./Select";

function SortBy({ options }: { options: SelectOption[] }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const sortBy = searchParams.get("sortBy") || "";

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    searchParams.set("sortBy", e.target.value);
    setSearchParams(searchParams);
  }

  return (
    <Select
      options={options}
      onChange={handleChange}
      variant="white"
      value={sortBy}
    />
  );
}

export default SortBy;
