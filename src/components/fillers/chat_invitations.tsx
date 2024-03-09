import React from 'react';

const NoChatInvitations = () => {
  return (
    <div className="w-2/3 max-md:w-[90%] h-fit mx-auto my-5 px-12 max-md:px-8 py-8 rounded-md font-primary dark:text-white border-gray-300 border-[1px] bg-white dark:bg-dark_primary_comp hover:shadow-lg dark:hover:shadow-2xl flex-center flex-col gap-2 cursor-default transition-ease-500">
      <div className="text-xl max-md:text-lg font-medium text-center">
        <span className="text-2xl font-semibold">Ah! </span> looks like you&apos;re short on invitations. 😕
      </div>
      <div className="flex flex-col gap-1 max-md:text-sm text-center">
        <div> Good things come to those who wait, and group chats are no exception. 🕒</div>
        <div>
          Keep being awesome, and before you know it, you&apos;ll be part of some
          <span className="w-fit mx-auto font-bold text-xl max-md:text-lg text-gradient">
            {' '}
            Exciting Conversations!
          </span>{' '}
          🌟
        </div>
      </div>
    </div>
  );
};

export default NoChatInvitations;
