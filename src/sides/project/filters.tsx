import { setFetchedApplications } from '@/slices/configSlice';
import { userIDSelector, userSelector } from '@/slices/userSlice';
import categories from '@/utils/categories';
import { SidePrimeWrapper } from '@/wrappers/side';
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

interface Props {
  order: string;
  setOrder: React.Dispatch<React.SetStateAction<string>>;
  category: string;
  setCategory: React.Dispatch<React.SetStateAction<string>>;
  time: string;
  setTime: React.Dispatch<React.SetStateAction<string>>;
  tags: string[];
  setTags: React.Dispatch<React.SetStateAction<string[]>>;
}

const FiltersAndOptions = ({ order, setOrder, category, setCategory, time, setTime, tags, setTags }: Props) => {
  const [customTag, setCustomTag] = useState('');

  const suggestedTags = ['AI/ML', 'Backend', 'Frontend', 'UX', 'UI', 'DevOps'];

  const toggleTag = (tag: string) => {
    setTags(prev => (prev.includes(tag) ? prev.filter(t => t !== tag) : [tag, ...prev]));
  };

  const addCustomTag = () => {
    if (customTag.trim() !== '') {
      toggleTag(customTag.trim());
      setCustomTag('');
    }
  };

  const clearFilters = () => {
    setOrder('Most Liked');
    setCategory('');
    setTime('Last 7 days');
    setTags([]);
  };

  const userID = useSelector(userIDSelector);

  const orders = ['trending', 'most_liked', 'most_viewed', ...(userID ? ['latest', 'last_viewed'] : [])];

  return (
    <SidePrimeWrapper stickTop>
      <div className="bg-gradient-to-r from-blue-400 to-blue-300 p-5 rounded-lg text-center text-white">
        <h2 className="text-lg font-semibold">
          Have <span className="italic">another</span>
        </h2>
        <h2 className="text-xl font-bold">
          amazing <span className="text-white">Idea</span>
        </h2>
        <button className="mt-3 bg-[#2FB0F6] text-white rounded-[100px] px-4 py-2 font-medium">+ Create Project</button>
      </div>
      <div className="mt-5">
        <div className="flex justify-between items-center text-white mb-3">
          <h3 className="text-lg font-semibold">Filters</h3>
          <button onClick={clearFilters} className="text-gray-400 text-xs">
            Clear all
          </button>
        </div>
        <div className="mb-3">
          <label className="text-gray-400 text-sm">Sort By</label>
          <select
            className="w-full mt-1 p-2 bg-dark_secondary_comp border border-gray-600 rounded-md"
            value={order}
            onChange={e => setOrder(e.target.value)}
          >
            {orders.map((order, index) => (
              <option
                className="w-full capitalize py-2 max-md:text-center hover:bg-primary_comp dark:hover:bg-dark_primary_comp_hover rounded-md cursor-pointer transition-ease-300"
                key={index}
              >
                {order.replaceAll('_', ' ')}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-3">
          <label className="text-gray-400 text-sm">Category</label>
          <select
            className="w-full mt-1 p-2 bg-dark_secondary_comp border border-gray-600 rounded-md"
            value={category}
            onChange={e => setCategory(e.target.value)}
          >
            {categories.map((category, index) => (
              <option
                className="w-full capitalize py-2 max-md:text-center hover:bg-primary_comp dark:hover:bg-dark_primary_comp_hover rounded-md cursor-pointer transition-ease-300"
                key={index}
              >
                {category.replaceAll('_', ' ')}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-3">
          <label className="text-gray-400 text-sm">Time Posted</label>
          <select
            className="w-full mt-1 p-2 bg-dark_secondary_comp border border-gray-600 rounded-md"
            value={time}
            onChange={e => setTime(e.target.value)}
          >
            <option>Last 7 days</option>
            <option>Last 15 days</option>
            <option>Last 30 days</option>
          </select>
        </div>
        <div className="mb-3">
          <label className="text-gray-400 text-sm">Tags</label>
          <input
            type="text"
            value={customTag}
            onChange={e => setCustomTag(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addCustomTag()}
            placeholder="Add custom tag"
            className="w-full mt-2 p-2 bg-dark_secondary_comp border border-gray-600 rounded-md text-white"
          />
          <div className="flex flex-wrap gap-2 mt-2">
            {tags
              .filter(tag => !suggestedTags.includes(tag))
              .map((tag, index) => (
                <button
                  key={index}
                  onClick={() => toggleTag(tag)}
                  className="px-3 py-1 rounded-md text-sm font-medium bg-blue-500 text-white border border-blue-500"
                >
                  {tag}
                </button>
              ))}
            {suggestedTags.map((tag, index) => (
              <button
                key={index}
                onClick={() => toggleTag(tag)}
                className={`px-3 py-1 rounded-md text-sm font-medium cursor-pointer transition-colors duration-200 hover:opacity-80 
                  border border-gray-600 ${
                    tags.includes(tag)
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'text-gray-300 hover:border-blue-500'
                  }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>
    </SidePrimeWrapper>
  );
};

export default FiltersAndOptions;
