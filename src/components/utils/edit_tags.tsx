import { ChangeEvent, KeyboardEvent, useState, useRef, useEffect } from 'react';
import TagSuggestions from './tag_suggestions';

interface Props {
  tags: string[];
  setTags: React.Dispatch<React.SetStateAction<string[]>>;

  maxTags?: number;
  blackBorder?: boolean;
  suggestions?: boolean;
}

const Tags = ({ tags, setTags, maxTags = 5, blackBorder = false, suggestions = false, }: Props) => {
  const [tagInput, setTagInput] = useState('');
  const handleTagInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setTagInput(event.target.value);
  };

  const handleTagInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      if (tags.length == maxTags) return;
      const newTag = tagInput.trim();
      if (!tags.includes(newTag) && newTag !== '') {
        setTags([...tags, newTag.toLowerCase()]);
        setTagInput('');
      }
    }
  };

  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);
  const dragStart = (e: any, position: number) => {
    dragItem.current = position;
  };
  const dragEnter = (e: any, position: number) => {
    dragOverItem.current = position;

  };
  const drop = (e: any) => {
    const copyListItems = [...tags];
    const dragItemContent = copyListItems[dragItem.current as number];
    copyListItems.splice(dragItem.current as number, 1);
    copyListItems.splice(dragOverItem.current as number, 0, dragItemContent);
    dragItem.current = null;
    dragOverItem.current = null;
    setTags(copyListItems);


  };

  const handleTagRemove = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };


  return (
    <>
      <div
        className={`w-full ${blackBorder
          ? 'p-4 border-black placeholder:text-[#202020c6] bg-[#ffffff40]'
          : 'p-2 bg-transparent border-primary_btn dark:border-dark_primary_btn'
          } border-[1px] flex flex-wrap items-center gap-2 rounded-md`}
      >
        {tags.map((tag, i) => (
          <div
            key={tag}
            className={`flex-center px-3 py-2 border-[1px] ${blackBorder ? 'border-black bg-[#ffffff40]' : 'border-gray-400 dark:border-dark_primary_btn'
              } text-sm rounded-full cursor-default active:border-2 active:border-[#000000]`}
            onDragStart={(e) => dragStart(e, i)} onDragEnter={(e) => dragEnter(e, i)} onDragEnd={drop}
            draggable={true}>
            {tag}
            <svg
              onClick={() => handleTagRemove(tag)}
              className="w-4 h-4 ml-1 cursor-pointer"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        ))}
        {tags.length < maxTags ? (
          <input
            type="text"
            className={`grow border-[1px] bg-transparent border-transparent rounded-md px-3 py-2 outline-none`}
            maxLength={20}
            value={tagInput}
            onChange={handleTagInputChange}
            onKeyDown={handleTagInputKeyDown}
          />
        ) : (
          <></>
        )}
      </div>
      {suggestions ? <TagSuggestions tags={tags} setTags={setTags} maxTags={maxTags} /> : <></>}
    </>
  );
};

export default Tags;
