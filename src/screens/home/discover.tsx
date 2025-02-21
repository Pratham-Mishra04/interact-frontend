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
import OrderMenu from '@/components/common/order_menu';
import { useSelector } from 'react-redux';
import { userIDSelector } from '@/slices/userSlice';

const Discover = () => {
  const [feed, setFeed] = useState<Post[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState('trending');

  const getFeed = (initialPage?: number) => {
    const URL = `${EXPLORE_URL}/posts?order=${order}&page=${initialPage ? initialPage : page}&limit=${10}`;
    getHandler(URL, undefined, true)
      .then(res => {
        if (res.statusCode === 200) {
          if (initialPage == 1) {
            setFeed(res.data.posts || []);
          } else {
            const addedFeed = [...feed, ...res.data.posts];
            if (addedFeed.length === feed.length) setHasMore(false);
            setFeed(addedFeed);
          }
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
    setPage(1);
    setFeed([]);
    setHasMore(true);
    setLoading(true);
    getFeed(1);
  }, [order]);

  const userID = useSelector(userIDSelector);

  return (
    <div className="w-full">
      <OrderMenu
        orders={['trending', ...(userID ? ['recommended'] : []), 'most_liked', 'latest']}
        current={order}
        setState={setOrder}
      />
      {loading ? (
        <PostsLoader />
      ) : feed.length === 0 ? (
        // <NoFeed />
        <></>
      ) : (
        <InfiniteScroll
          className="w-full"
          dataLength={feed.length}
          next={getFeed}
          hasMore={hasMore}
          loader={<PostsLoader />}
        >
          {feed.map((post, index) => {
            if (post.rePost) return <RePostComponent key={index} post={post} />;
            else return <PostComponent key={index} post={post} />;
          })}
        </InfiniteScroll>
      )}
    </div>
  );
};

export default Discover;
