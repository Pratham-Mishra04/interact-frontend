import Loader from '@/components/common/loader';
import PostComponent from '@/components/home/post';
import getHandler from '@/handlers/get_handler';
import { Post } from '@/types';
import Toaster from '@/utils/toaster';
import React, { useEffect, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import RePostComponent from '@/components/home/repost';
import { EXPLORE_URL } from '@/config/routes';
import { SERVER_ERROR } from '@/config/errors';
import PostsLoader from '@/components/loaders/posts';
import { navbarOpenSelector } from '@/slices/feedSlice';
import { useSelector } from 'react-redux';

const Discover = () => {
  const [feed, setFeed] = useState<Post[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const [option, setOption] = useState(1);

  const [clickedOnOptions, setClickedOnOptions] = useState(false);

  const open = useSelector(navbarOpenSelector);

  const getFeed = () => {
    const URL = `${EXPLORE_URL}/posts/trending?page=${page}&limit=${5}`;
    getHandler(URL)
      .then(res => {
        if (res.statusCode === 200) {
          const addedFeed = [...feed, ...res.data.posts];
          if (addedFeed.length === feed.length) setHasMore(false);
          setFeed(addedFeed);
          setPage(prev => prev + 1);
          setLoading(false);
        } else {
          if (res.data.message) Toaster.error(res.data.message, 'error_toaster');
          else {
            Toaster.error(SERVER_ERROR, 'error_toaster');
          }
        }
      })
      .catch(err => {
        Toaster.error(SERVER_ERROR, 'error_toaster');
      });
  };

  useEffect(() => {
    // setPage(1);
    // setFeed([]);
    getFeed();
  }, [option]);

  return (
    <div className={`w-full flex ${open ? 'gap-2' : 'gap-12'} transition-ease-out-500`}>
      {/* <div
        onClick={() => setClickedOnOptions(prev => !prev)}
        className="h-12 rotate-90 text-primary_text dark:text-white fixed flex-center top-[90px] right-[25vw] cursor-pointer"
      >
        •••
      </div>
      {clickedOnOptions ? (
        <div className="w-fit h-fit p-2 font-primary text-xl flex flex-col fixed top-[150px] right-[25vw] rounded-xl glassMorphism z-20">
          <div
            onClick={() => setOption(1)}
            className="w-full px-4 py-3 hover:bg-[#ffffff78] dark:hover:bg-[#ffffff19] transition-ease-100 rounded-lg"
          >
            Trending
          </div>
          <div
            onClick={() => setOption(2)}
            className="w-full px-4 py-3 hover:bg-[#ffffff78] dark:hover:bg-[#ffffff19] transition-ease-100 rounded-lg"
          >
            Latest
          </div>
        </div>
      ) : (
        <></>
      )} */}
      <div className="w-full max-lg:w-[80vw] max-md:w-screen flex flex-col gap-2">
        {loading ? (
          <PostsLoader />
        ) : (
          <>
            {feed.length === 0 ? (
              // <NoFeed />
              <></>
            ) : (
              <InfiniteScroll
                className="w-full flex flex-col gap-4 dark:gap-0"
                dataLength={feed.length}
                next={getFeed}
                hasMore={hasMore}
                loader={<PostsLoader />}
              >
                {feed.map(post => {
                  if (post.rePost) return <RePostComponent key={post.id} post={post} />;
                  else return <PostComponent key={post.id} post={post} />;
                })}
              </InfiniteScroll>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Discover;
