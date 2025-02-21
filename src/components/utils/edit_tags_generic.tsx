import { ChangeEvent, KeyboardEvent, useState } from 'react';

interface Props {
  tags: string[];
  setTags: React.Dispatch<React.SetStateAction<string[]>> | ((tags: string[]) => void);
  maxTags?: number;
  maxLength?: number;
  suggestions?: boolean;
  onboardingDesign?: boolean;
  borderStyle?: string;
  borderColor?: string;
  lowerOnly?: boolean;
  draggable?: boolean;
}

const Tags = ({
  tags,
  setTags,
  maxTags = 5,
  maxLength = 20,
  onboardingDesign = false,
  borderStyle = 'solid',
  borderColor,
  lowerOnly = true,
}: Props) => {
  const [tagInput, setTagInput] = useState('');

  const handleTagInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setTagInput(event.target.value);
  };

  const handleTagInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      if (tagInput.trim() !== '') {
        // Split the input value by commas, trim each part, and add to tags
        const newTags = tagInput
          .split(',')
          .map(tag => (lowerOnly ? tag.trim().toLowerCase() : tag.trim()))
          .filter(tag => tag !== '');

        // Add unique new tags to the existing tags
        const uniqueNewTags = Array.from(new Set(newTags));
        const updatedTags = [...tags, ...uniqueNewTags.slice(0, maxTags - tags.length)];
        const newtags = Array.from(new Set(updatedTags));
        setTags(newtags);
        setTagInput('');
      }
    } else if (event.key === 'Backspace' && tagInput === '') {
      event.preventDefault();
      const lastTag = tags[tags.length - 1];
      if (lastTag) {
        handleTagRemove(lastTag);
      }
    }
  };

  const handleTagRemove = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <>
      <div
        style={{
          borderStyle: `${borderStyle} `,
          borderColor: `${borderColor ? borderColor : onboardingDesign ? 'black' : '#9ca3af'}`,
        }}
        className={`w-full ${
          onboardingDesign ? 'p-3 placeholder:text-[#202020c6] bg-[#ffffff40]' : 'p-2 bg-transparent'
        } dark:text-white border-[1px] border-gray-400 dark:border-dark_primary_btn flex flex-wrap items-center gap-2 rounded-md`}
      >
        {tags.map((tag, i) => (
          <div
            style={{
              borderColor: `${borderColor ? borderColor : onboardingDesign ? 'black' : '#9ca3af'}`,
            }}
            key={tag}
            className="flex-center text-xs px-2 py-1 border-[1px] rounded-full cursor-default active:border-2 active:border-black"
          >
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

        {tags.length < maxTags && (
          <input
            type="text"
            className="grow text-sm border-[1px] bg-transparent border-transparent rounded-md px-3 py-2 outline-none"
            maxLength={maxLength}
            value={tagInput}
            onChange={handleTagInputChange}
            onKeyDown={handleTagInputKeyDown}
          />
        )}
      </div>
    </>
  );
};

export default Tags;
