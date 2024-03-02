import React from 'react';

interface Props {
  label: string;
  loadingLabel: string;
  loading: boolean;
  onClick?: () => void;
}

const BuildButton = ({ label, loadingLabel, loading, onClick }: Props) => {
  return (
    <button
      onClick={onClick}
      className={`duration-300 relative group cursor-pointer text-white overflow-hidden h-14 max-lg:h-12 ${
        loading ? 'w-64 max-lg:w-56 scale-90' : 'w-44 max-lg:w-36 hover:scale-90'
      } rounded-xl p-2 flex-center`}
    >
      <div
        className={`absolute right-32 -top-4 ${
          loading ? 'top-0 right-2 scale-150' : 'scale-125 group-hover:top-1 group-hover:right-2 group-hover:scale-150'
        } z-10 w-36 h-36 rounded-full duration-500 bg-[#6661c7]`}
      ></div>
      <div
        className={`absolute right-2 -top-4 ${
          loading
            ? 'top-1 right-2 scale-150'
            : 'scale-125 right-3 group-hover:top-1 group-hover:right-2 group-hover:scale-150'
        } z-10 w-24 h-24 rounded-full duration-500 bg-[#ada9ff]`}
      ></div>
      <div
        className={`absolute -right-10 top-0 ${
          loading ? 'top-1 right-2 scale-150' : 'group-hover:top-1 group-hover:right-2 group-hover:scale-150'
        } z-10 w-20 h-20 rounded-full duration-500 bg-[#cea9ff]`}
      ></div>
      <div
        className={`absolute right-20 -top-4 ${
          loading ? 'top-1 right-2 scale-125' : 'group-hover:top-1 group-hover:right-2 group-hover:scale-125'
        } z-10 w-16 h-16 rounded-full duration-500 bg-[#df96ff]`}
      ></div>
      <div
        className={`w-[96%] h-[90%] bg-gray-50 ${
          loading ? 'opacity-100' : 'opacity-0'
        } absolute rounded-xl z-10 transition-ease-500`}
      ></div>
      <p className={`z-10 font-bold text-xl max-lg:text-lg transition-ease-500`}>
        {loading ? (
          <div className="w-fit text-gradient transition-ease-out-300 animate-fade_half">{loadingLabel}</div>
        ) : (
          <div className="">{label}</div>
        )}
      </p>
    </button>
  );
};

export default BuildButton;
