import React, { useState, useEffect } from 'react';

const CreateNewProject = () => {
  const [sortBy, setSortBy] = useState('Most Liked');
  const [category, setCategory] = useState('Example : AI/ML');
  const [timePosted, setTimePosted] = useState('Last 7 days');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState('');
  const allTags = ['AI/ML', 'Backend', 'Frontend', 'UX', 'UI', 'DevOps', 'Kuch Bhi', '+8 more'];

  useEffect(() => {
    console.log('Selected Tags:', selectedTags);
  }, [selectedTags]);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => (prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]));
  };

  const addCustomTag = () => {
    if (customTag.trim() !== '') {
      toggleTag(customTag.trim());
      setCustomTag('');
    }
  };

  const clearFilters = () => {
    setSortBy('Most Liked');
    setCategory('Example : AI/ML');
    setTimePosted('Last 7 days');
    setSelectedTags([]);
  };

  return (
    <div className="w-full bg-dark_primary_comp p-4 rounded-xl shadow-lg border border-[#404040] dark:border-[#525252]">
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
          <button onClick={clearFilters} className="text-gray-400 text-sm">
            Clear all
          </button>
        </div>
        <div className="mb-3">
          <label className="text-gray-400 text-sm">Sort By</label>
          <select
            className="w-full mt-1 p-2 bg-dark_secondary_comp border border-gray-600 rounded-md"
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
          >
            <option>Most Liked</option>
            <option>Recently Added</option>
          </select>
        </div>
        <div className="mb-3">
          <label className="text-gray-400 text-sm">Category</label>
          <select
            className="w-full mt-1 p-2 bg-dark_secondary_comp border border-gray-600 rounded-md"
            value={category}
            onChange={e => setCategory(e.target.value)}
          >
            <option>Example : AI/ML</option>
          </select>
        </div>
        <div className="mb-3">
          <label className="text-gray-400 text-sm">Time Posted</label>
          <select
            className="w-full mt-1 p-2 bg-dark_secondary_comp border border-gray-600 rounded-md"
            value={timePosted}
            onChange={e => setTimePosted(e.target.value)}
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
            {allTags.map((tag, index) => (
              <button
                key={index}
                onClick={() => toggleTag(tag)}
                className={`px-3 py-1 rounded-md text-sm font-medium cursor-pointer transition-colors duration-200 hover:opacity-80 
                  border border-gray-600 ${
                    selectedTags.includes(tag)
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'text-gray-300 hover:border-blue-500'
                  }`}
              >
                {tag}
              </button>
            ))}
            {selectedTags
              .filter(tag => !allTags.includes(tag))
              .map((tag, index) => (
                <button
                  key={index}
                  onClick={() => toggleTag(tag)}
                  className="px-3 py-1 rounded-md text-sm font-medium bg-blue-500 text-white border border-blue-500"
                >
                  {tag}
                </button>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateNewProject;
