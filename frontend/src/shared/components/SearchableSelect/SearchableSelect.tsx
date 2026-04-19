import React, { useState, useCallback, useMemo } from "react";
import { Select, Spin } from "antd";
import type { SelectProps } from "antd";
import { debounce } from "@app/shared/utils/debounce";

export interface SearchOption {
  id: number;
  label: string;
  [key: string]: any;
}

interface SearchableSelectProps<T extends SearchOption> extends Omit<
  SelectProps<number>,
  "options" | "onSearch"
> {
  fetchOptions: (query: string) => Promise<T[]>;
  placeholder?: string;
  allowClear?: boolean;
  minCharsToSearch?: number;
}

const SearchableSelect = React.forwardRef<
  any,
  SearchableSelectProps<SearchOption>
>(
  (
    {
      fetchOptions,
      placeholder = "Search...",
      allowClear = true,
      minCharsToSearch = 1,
      ...props
    },
    ref
  ) => {
    const [options, setOptions] = useState<SearchOption[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const handleSearch = useCallback(
      debounce(async (value: string) => {
        if (value.length < minCharsToSearch) {
          setOptions([]);
          return;
        }

        setIsLoading(true);
        try {
          const results = await fetchOptions(value);
          setOptions(results);
        } catch (error) {
          console.error("Error fetching options:", error);
          setOptions([]);
        } finally {
          setIsLoading(false);
        }
      }, 300),
      [fetchOptions, minCharsToSearch]
    );

    const selectOptions = useMemo(
      () =>
        options.map((option) => ({
          label: option.label,
          value: option.id,
        })),
      [options]
    );

    const handleSearchChange = (value: string) => {
      handleSearch(value);
    };

    return (
      <Select
        ref={ref}
        placeholder={placeholder}
        allowClear={allowClear}
        showSearch
        filterOption={false}
        onSearch={handleSearchChange}
        options={selectOptions}
        notFoundContent={isLoading ? <Spin size="small" /> : null}
        {...props}
      />
    );
  }
);

SearchableSelect.displayName = "SearchableSelect";

export default SearchableSelect;
