import React, { useEffect, useState } from 'react';
import Toaster from '@/utils/toaster';
import { useDispatch, useSelector } from 'react-redux';
import { setGithubUsername, userSelector } from '@/slices/userSlice';
import { SERVER_ERROR } from '@/config/errors';
import { BACKEND_URL } from '@/config/routes';
import { useRouter } from 'next/router';
import GithubRepos from './github_repos';
import Cookies from 'js-cookie';

const Github = () => {
  const [clickedOnViewRepositories, setClickedOnViewRepositories] = useState(false);

  const dispatch = useDispatch();

  const handleSubmit = async () => {
    window.location.assign(`${BACKEND_URL}/auth/github?token=${Cookies.get('token')}`);
  };

  const user = useSelector(userSelector);

  const router = useRouter();

  useEffect(() => {
    const status = new URLSearchParams(window.location.search).get('status');
    const username = new URLSearchParams(window.location.search).get('username');
    const message = new URLSearchParams(window.location.search).get('message');

    if (status || message) {
      const { query } = router;

      if (status) {
        if (status && status == '1') {
          Toaster.success('Github Connected!');
          if (username && username != '') dispatch(setGithubUsername(username));
        } else if (status && status == '0') {
          if (message) {
            Toaster.error(message);
            delete query.message;
          } else Toaster.error(SERVER_ERROR);
        }
        delete query.status;
      }

      router.replace({
        pathname: router.pathname,
        query: { ...query },
      });
    }
  }, []);

  return (
    <div className="w-full flex flex-col gap-2 pt-4 border-t-[1px] border-gray-400 text-primary_black dark:text-white">
      {clickedOnViewRepositories && <GithubRepos setShow={setClickedOnViewRepositories} />}
      <div className="text-xl font-semibold">Connect Interact to your Github!</div>
      <div className="w-full flex max-md:flex-col md:items-center justify-between gap-4">
        {user.githubUsername && (
          <div className="w-fit flex flex-col gap-1">
            <div className="flex-center gap-2">
              Your Github Username:
              <div className="font-semibold"> {user.githubUsername}</div>
            </div>
            <div
              onClick={() => setClickedOnViewRepositories(true)}
              className="w-fit text-xs cursor-pointer hover-underline-animation after:bg-gray-700"
            >
              View Connected Repositories
            </div>
          </div>
        )}
        <button
          onClick={handleSubmit}
          className={`${
            !user.githubUsername && 'w-full'
          } group flex justify-center items-center gap-2 group-hover:before:duration-500 group-hover:after:duration-500 after:duration-500 hover:border-neutral-900 duration-500 hover:duration-500 underline underline-offset-2 hover:underline hover:underline-offset-4 origin-left hover:decoration-2 hover:text-neutral-300 relative bg-neutral-900 px-10 py-4 border text-left p-3 text-gray-50 text-base font-bold rounded-lg overflow-hidden after:absolute after:z-10 after:w-12 after:h-12 after:content[''] after:bg-sky-900 after:-left-8 after:top-8 after:rounded-full after:blur-lg hover:after:animate-pulse`}
        >
          <svg
            className="w-6 h-6 fill-neutral-50"
            height="100"
            preserveAspectRatio="xMidYMid meet"
            viewBox="0 0 100 100"
            width="100"
            x="0"
            xmlns="http://www.w3.org/2000/svg"
            y="0"
          >
            <path
              className="svg-fill-primary"
              d="M50,1.23A50,50,0,0,0,34.2,98.68c2.5.46,3.41-1.09,3.41-2.41s0-4.33-.07-8.5c-13.91,3-16.84-6.71-16.84-6.71-2.28-5.77-5.55-7.31-5.55-7.31-4.54-3.1.34-3,.34-3,5,.35,7.66,5.15,7.66,5.15C27.61,83.5,34.85,81.3,37.7,80a10.72,10.72,0,0,1,3.17-6.69C29.77,72.07,18.1,67.78,18.1,48.62A19.34,19.34,0,0,1,23.25,35.2c-.52-1.26-2.23-6.34.49-13.23,0,0,4.19-1.34,13.75,5.13a47.18,47.18,0,0,1,25,0C72.07,20.63,76.26,22,76.26,22c2.72,6.89,1,12,.49,13.23a19.28,19.28,0,0,1,5.14,13.42c0,19.21-11.69,23.44-22.83,24.67,1.8,1.55,3.4,4.6,3.4,9.26,0,6.69-.06,12.08-.06,13.72,0,1.34.9,2.89,3.44,2.4A50,50,0,0,0,50,1.23Z"
            ></path>
          </svg>
          {user.githubUsername ? 'Update Sync' : ' Connect Interact to Github'}
        </button>
      </div>
      <div className="w-full flex flex-col gap-1">
        <div className="text-lg font-medium">Why Connect Your GitHub Account to Interact?</div>
        <ul className="list-disc ml-4 flex flex-col gap-4 text-gray-700 dark:text-white mt-2">
          <li>
            By connecting Interact with your GitHub account, updates from pull requests (PRs) on your repositories will
            be automatically linked to the relevant tasks. To link a task to a PR, simply include the Task ID from your
            task view in the PR title.
          </li>
          <li>
            If you are a collaborator but haven&apos;t connected Interact to your GitHub account, any PR activity you
            perform won&apos;t be reflected in Interact.
          </li>
          <li>
            If you create a new repository and want it included in your Interact connection, just click on the update
            sync option.
          </li>
          <li>
            A task can only be associated with one PR. Any additional PRs that include the same Task ID will be ignored.
          </li>
          <li>
            Interact does not read your code or have direct access to your repositories, ensuring that your private code
            remains secure.
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Github;
