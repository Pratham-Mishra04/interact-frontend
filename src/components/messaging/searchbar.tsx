import { MagnifyingGlass } from '@phosphor-icons/react';
import { useRouter } from 'next/router';
import React, { useState } from 'react';

const SearchBar = () => {
  const [search, setSearch] = useState('');
  const router = useRouter();

  const handleSubmit = (el: React.FormEvent<HTMLFormElement>) => {
    el.preventDefault();
    if (search.trim() != '') router.push(`/messaging?search=${search}`);
    else router.push(`/messaging`);
  };
  return (
    <form
      onSubmit={handleSubmit}
      className="w-full h-10 px-4 py-2 flex items-center justify-between gap-8 mx-auto rounded-md shadow-md dark:shadow-outer bg-white dark:bg-dark_primary_comp"
    >
      <input
        className="h-full grow bg-transparent focus:outline-none font-primary dark:text-white font-medium"
        type="text"
        placeholder="Search"
        value={search}
        onChange={el => setSearch(el.target.value)}
      />
      <MagnifyingGlass size={24} className="text-gray-600 dark:text-white opacity-75" />
    </form>
  );
};

export default SearchBar;
