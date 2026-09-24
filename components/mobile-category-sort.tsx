"use client";

import type { ChangeEvent } from "react";

type MobileCategorySortProps = {
  action: string;
  value: string;
  preservedParams: Array<[string, string | undefined]>;
};

export function MobileCategorySort({ action, value, preservedParams }: MobileCategorySortProps) {
  function submitOnChange(event: ChangeEvent<HTMLSelectElement>) {
    event.currentTarget.form?.requestSubmit();
  }

  return (
    <form action={action} className="kids-catalog-mobile-sort">
      {preservedParams.map(([name, paramValue]) =>
        paramValue ? <input key={name} type="hidden" name={name} value={paramValue} /> : null
      )}
      <label>
        <span className="sr-only">Sort products</span>
        <select aria-label="Sort products" name="sort_by" defaultValue={value} onChange={submitOnChange}>
          <option value="newest">Newest</option>
          <option value="popular">Popular</option>
          <option value="marketplace">Marketplace signals</option>
          <option value="bestseller">Bestsellers</option>
          <option value="top_rated">Top rated</option>
          <option value="price_asc">Price: low to high</option>
          <option value="price_desc">Price: high to low</option>
        </select>
      </label>
    </form>
  );
}
