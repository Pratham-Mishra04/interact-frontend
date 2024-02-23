import { EXPLORE_URL } from '@/config/routes';
import postHandler from '@/handlers/post_handler';
import { MagnifyingGlass } from '@phosphor-icons/react';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import SearchSuggestions from './search_suggestions';
import Filters from './filters';
import { signal } from '@preact/signals-react';
interface Props {
  initialValue?: string;
}

const SearchBar = ({ initialValue = '' }: Props) => {
  const search = signal(initialValue);
  const router = useRouter();
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const [clickedOnFilters, setClickedOnFilters] = useState(false);

  let searchVal = search.value;

  const submitSearch = async () => {
    const URL = `${EXPLORE_URL}/search`;
    await postHandler(URL, {
      searchVal,
    });
  };

  const handleChange = (el: React.ChangeEvent<HTMLInputElement>) => {
    setShowSearchSuggestions(true);
    search.value = el.target.value;
  };

  const handleSubmit = (el?: React.FormEvent<HTMLFormElement>) => {
    el?.preventDefault();
    if (search.value === '') router.push('/explore');
    else {
      submitSearch();
      setShowSearchSuggestions(false);
      router.push(`/explore?search=${search.value}`);
    }
  };

  useEffect(() => {
    if (search.value == '' && new URLSearchParams(window.location.search).get('pid') != null)
      search.value = new URLSearchParams(window.location.search).get('pid') || '';
  }, [window.location.search]);

  return (
    <>
      {clickedOnFilters ? <Filters setShow={setClickedOnFilters} /> : <></>}
      {showSearchSuggestions ? <SearchSuggestions search={search} setShow={setShowSearchSuggestions} /> : <></>}
      <div className="relative md:hidden w-taskbar max-md:w-taskbar_md mx-auto">
        <form
          onSubmit={handleSubmit}
          className={`w-full h-taskbar px-4 text-gray-500 ${
            search.value.trim().length > 0 ? 'bg-white' : 'bg-gray-100'
          } dark:text-white flex items-center justify-between gap-8 mx-auto rounded-md border-white border-2 dark:border-0 shadow-lg dark:shadow-outer dark:bg-gradient-to-b dark:from-dark_primary_gradient_start dark:to-dark_primary_gradient_end transition-ease-200`}
        >
          <input
            className="h-full grow bg-transparent focus:outline-none font-primary font-medium"
            type="text"
            onClick={() => setShowSearchSuggestions(true)}
            placeholder="Search"
            // value={search.value}
            onChange={handleChange}
          />
          <MagnifyingGlass size={32} className="opacity-75" />
        </form>
        {showSearchSuggestions && <SearchSuggestions search={search} setShow={setShowSearchSuggestions} />}
      </div>
      <div className="w-[640px] max-md:hidden flex items-center gap-2 fixed top-2 right-1/2 translate-x-1/2 max-md:w-taskbar_md mx-auto z-20">
        <form
          onSubmit={handleSubmit}
          className="grow h-11 px-4 border-[1px] border-gray-300 text-gray-500 bg-gray-100 flex items-center justify-between gap-8 mx-auto rounded-md"
        >
          <input
            className="h-full grow bg-transparent focus:outline-none font-primary font-medium"
            type="text"
            onClick={() => setShowSearchSuggestions(true)}
            placeholder="Search"
            onChange={handleChange}
            // value={search.value}
          />
          <MagnifyingGlass
            onClick={() => handleSubmit()}
            size={24}
            className="opacity-75 cursor-pointer"
            weight="bold"
          />
        </form>
        {/* <SlidersHorizontal
          onClick={() => {
            setShowSearchSuggestions(false);
            setClickedOnFilters(true);
          }}
          className="cursor-pointer text-gray-500 hover:bg-gray-100 rounded-full p-2 flex-center transition-ease-300"
          size={42}
          weight="duotone"
        /> */}
      </div>
    </>
  );
};

export default SearchBar;
