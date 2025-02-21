const NoChats = () => {
  return (
    <div className="w-full max-md:w-[90%] h-fit mx-auto px-8 py-2 rounded-md font-primary dark:text-white bg-white dark:bg-dark_primary_comp hover:shadow-lg dark:hover:shadow-2xl flex-center flex-col gap-2 cursor-pointer transition-ease-500">
      <div className="text-xl max-md:text-lg font-medium text-center">
        <span className="text-2xl font-semibold">Oh no!</span> It seems you don&apos;t have any chats yet.
      </div>
      <div className="flex flex-col gap-1 max-md:text-sm text-center">
        <div>
          Great ideas start with great conversations. Don&apos;t miss out on the chance to brainstorm and collaborate!
        </div>
        <div>
          <span className="font-bold text-xl max-md:text-lg text-gradient">Create a New Chat</span>
        </div>
      </div>
    </div>
  );
};

export default NoChats;
