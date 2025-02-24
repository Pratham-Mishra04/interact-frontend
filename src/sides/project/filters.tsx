import categories from '@/utils/categories';
import { SidePrimeWrapper } from '@/wrappers/side';
import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Project } from '@/types';
import NewProject from '@/sections/workspace/new_project';

interface Props {
  order: string;
  setOrder: React.Dispatch<React.SetStateAction<string>>;
  orders: string[];
  category?: string;
  setCategory?: React.Dispatch<React.SetStateAction<string>>;
  time: string;
  setTime: React.Dispatch<React.SetStateAction<string>>;
  tags?: string[];
  setTags?: React.Dispatch<React.SetStateAction<string[]>>;
  setProjects?: React.Dispatch<React.SetStateAction<Project[]>>;
}

const FiltersAndOptions = ({
  order,
  setOrder,
  orders,
  category,
  setCategory,
  time,
  setTime,
  tags,
  setTags,
  setProjects,
}: Props) => {
  const [customTag, setCustomTag] = useState('');

  const suggestedTags = ['AI/ML', 'Backend', 'Frontend', 'UX', 'UI', 'DevOps'];

  const toggleTag = (tag: string) => {
    if (setTags) setTags(prev => (prev.includes(tag) ? prev.filter(t => t !== tag) : [tag, ...prev]));
  };

  const addCustomTag = () => {
    if (customTag.trim() !== '') {
      toggleTag(customTag.trim());
      setCustomTag('');
    }
  };

  const clearFilters = () => {
    setOrder(orders[0]);
    if (setCategory) setCategory('');
    setTime('');
    if (setTags) setTags([]);
  };

  const times = ['24_hours', '7_days', '15_days', '30_days'];

  return (
    <SidePrimeWrapper stickTop>
      {/* <div className="bg-gradient-to-r from-blue-400 to-blue-300 p-5 rounded-lg text-center text-white">
        <h2 className="text-lg font-semibold">
          Have <span className="italic">another</span>
        </h2>
        <h2 className="text-xl font-bold">
          amazing <span className="text-white">Idea</span>
        </h2>
        <button className="mt-3 bg-[#2FB0F6] text-white rounded-[100px] px-4 py-2 font-medium">+ Create Project</button>
      </div> */}
      <NewProject setProjects={setProjects} />
      <div className="mt-5">
        <div className="flex justify-between items-center text-white mb-3">
          <h3 className="text-lg font-semibold">Filters</h3>
          <button onClick={clearFilters} className="text-gray-400 text-xs">
            Clear all
          </button>
        </div>
        <div className="mb-3 space-y-1">
          <div className="text-gray-400 text-sm">Sort By</div>
          <Select defaultValue={order} onValueChange={val => setOrder(val)}>
            <SelectTrigger className="w-full capitalize">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {orders.map((order, index) => (
                <SelectItem key={index} value={order}>
                  {order.replaceAll('_', ' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {category && setCategory && (
          <div className="mb-3">
            <label className="text-gray-400 text-sm">Category</label>
            <Select defaultValue={category} onValueChange={val => setCategory(val)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.slice(1).map((category, index) => (
                  <SelectItem key={index} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        <div className="mb-3">
          <label className="text-gray-400 text-sm">Time Posted</label>
          <Select defaultValue={time} onValueChange={val => setTime(val)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Time" />
            </SelectTrigger>
            <SelectContent>
              {times.map((time, index) => (
                <SelectItem key={index} value={time}>
                  Last {time.replaceAll('_', ' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {tags && setTags && (
          <div className="mb-3">
            <label className="text-gray-400 text-sm">Tags</label>
            <input
              type="text"
              value={customTag}
              onChange={e => setCustomTag(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addCustomTag()}
              placeholder="Search for tags"
              className="w-full mt-2 p-2 text-sm bg-dark_secondary_comp border border-gray-600 rounded-md text-white"
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
                     border ${
                       tags.includes(tag)
                         ? 'bg-blue-500 text-white border-blue-500'
                         : 'text-gray-300 border-gray-600 hover:border-blue-500'
                     }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </SidePrimeWrapper>
  );
};

export default FiltersAndOptions;
