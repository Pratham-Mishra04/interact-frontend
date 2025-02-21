import React, { useEffect, useRef, useState } from 'react';
import { DropdownOption, FilterButton } from './common';
import { Backspace, Tag } from '@phosphor-icons/react';

interface Props {
  selectedTags: string[];
  setSelectedTags: React.Dispatch<React.SetStateAction<string[]>>;
  maxLength?: number;
}

const Tags = ({ selectedTags, setSelectedTags, maxLength = 5 }: Props) => {
  const [show, setShow] = useState(false);
  const [tagSearch, setTagSearch] = useState('');

  const menuRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = (event: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
      setShow(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleAddNewTag = (el: React.FormEvent<HTMLFormElement> | undefined) => {
    el?.preventDefault();
    setSelectedTags(prev => [...prev, tagSearch]);
    setTagSearch('');
  };

  return (
    <div ref={menuRef} className="relative z-10">
      <FilterButton
        fieldName="Tags"
        filledText={selectedTags.length == 0 ? '' : `${selectedTags.length} Selected`}
        icon={<Tag />}
        setShow={setShow}
      />
      {show && (
        <div className="w-48 h-fit p-3 bg-white dark:bg-dark_primary_comp dark:border-dark_primary_btn flex flex-col gap-2 absolute -bottom-2 left-0 translate-y-full rounded-md border-[1px] border-gray-200 shadow-md animate-fade_third">
          <div className="w-full flex justify-between items-center">
            <div className="text-xl font-medium">Tags</div>
            <Backspace
              onClick={() => {
                setSelectedTags([]);
                setShow(false);
              }}
              className="cursor-pointer"
              size={20}
            />
          </div>
          {selectedTags.length < maxLength && (
            <form onSubmit={handleAddNewTag}>
              <input
                value={tagSearch}
                onChange={el => setTagSearch(el.target.value)}
                maxLength={25}
                type="text"
                className="w-full text-sm bg-transparent focus:outline-none border-[1px] rounded-md p-2"
                placeholder="Search"
              />
            </form>
          )}

          <div className="w-full flex flex-col gap-1">
            {selectedTags.map((tag, index) => (
              <DropdownOption
                key={index}
                option={tag}
                isOptionSelected={true}
                onClick={() => {
                  setSelectedTags(prev => {
                    if (prev.includes(tag)) return prev.filter(t => t != tag);
                    return [...prev, tag];
                  });
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Tags;
