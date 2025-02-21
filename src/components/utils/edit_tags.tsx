import { ChangeEvent, KeyboardEvent, useState, useRef } from 'react';
import TagSuggestions from './tag_suggestions';

interface Props {
  tags: string[];
  setTags: React.Dispatch<React.SetStateAction<string[]>> | ((val: string[]) => void);
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
  suggestions = false,
  borderStyle = 'solid',
  borderColor,
  lowerOnly = true,
  draggable = true,
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

  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  const dragStart = (e: any, position: number) => {
    if (e.currentTarget.classList) {
      e.currentTarget.classList.add('dragged-tag');
    }
    dragItem.current = position;
  };

  const dragEnter = (e: any, position: number) => {
    dragOverItem.current = position;
  };
  const drop = (e: any) => {
    if (e.currentTarget.classList) {
      e.currentTarget.classList.remove('dragged-tag');
    }
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
            onDragStart={e => dragStart(e, i)}
            onDragEnter={e => dragEnter(e, i)}
            onDragEnd={drop}
            draggable={draggable}
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

        {/* <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="droppable">
            {provided => (
              <div
                className="w-full flex flex-wrap items-center gap-2 "
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                {tags.map((item, index) => (
                  <Draggable key={index} draggableId={index.toString()} index={index}>
                    {(provided, snapshot) => (
                      <div
                        className="w-fit flex-center px-2 py-1 border-[1px] text-sm rounded-full cursor-default active:border-2 active:border-black"
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        style={{
                          backgroundColor: snapshot.isDragging ? 'gray' : 'white',
                          ...provided.draggableProps.style,
                        }}
                      >
                        {item}
                      </div>
                    )}
                  </Draggable>
                ))}
                {tags.length < maxTags && (
                  <input
                    type="text"
                    className="grow text-sm border-[1px] bg-transparent border-transparent rounded-md px-3 py-2 outline-none"
                    maxLength={20}
                    value={tagInput}
                    onChange={handleTagInputChange}
                    onKeyDown={handleTagInputKeyDown}
                  />
                )}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext> */}

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
      {suggestions && (
        <TagSuggestions match={tagInput} setMatch={setTagInput} tags={tags} setTags={setTags} maxTags={maxTags} />
      )}
    </>
  );
};

export default Tags;
