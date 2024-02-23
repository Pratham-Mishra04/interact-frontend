import { GetServerSidePropsContext } from 'next/types';
import React, { useEffect } from 'react';
import Toaster from '@/utils/toaster';
import { useDispatch } from 'react-redux';
import socketService from '@/config/ws';
import { resetConfig } from '@/slices/configSlice';
import { setPasswordSetupStatus, setUser } from '@/slices/userSlice';
import { User } from '@/types';
import Cookies from 'js-cookie';
import { BACKEND_URL } from '@/config/routes';
import nookies from 'nookies';
import { SERVER_ERROR } from '@/config/errors';
import useUserStateFetcher from '@/hooks/user_fetcher';
import configuredAxios from '@/config/axios';

interface Props {
  token: string;
}

const LoginCallback = ({ token }: Props) => {
  const dispatch = useDispatch();

  const userStateFetcher = useUserStateFetcher();

  useEffect(() => {
    configuredAxios
      .get(`${BACKEND_URL}/auth/login`, { headers: { Authorization: 'Bearer ' + token }, withCredentials: true })
      .then(res => {
        if (res.status == 200) {
          Toaster.success('Logged In');
          const user: User = res.data.user;
          user.email = res.data.email;
          user.phoneNo = res.data.phoneNo || '';
          user.resume = res.data.resume || '';
          Cookies.set('token', res.data.token, {
            expires: Number(process.env.NEXT_PUBLIC_COOKIE_EXPIRATION_TIME),
          });
          Cookies.set('id', user.id, {
            expires: Number(process.env.NEXT_PUBLIC_COOKIE_EXPIRATION_TIME),
          });
          dispatch(setUser(user));
          dispatch(resetConfig());
          dispatch(setPasswordSetupStatus(res.data.isPasswordSetupComplete || false));
          socketService.connect(user.id);
          userStateFetcher();
          if (user.isVerified) {
            Cookies.set('verified', 'true');
            window.location.replace('/home');
          } else window.location.assign('/verification');
        }
      })
      .catch(err => {
        if (err.response?.data?.message) {
          Toaster.error(err.response.data.message);
        } else {
          Toaster.error(SERVER_ERROR, 'error_toaster');
        }

        window.location.replace('/login');
      });
  }, []);

  return <div></div>;
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const access_token = nookies.get(context).token;
  if (access_token && process.env.NODE_ENV != 'development') {
    return {
      redirect: {
        permanent: true,
        destination: '/home',
      },
      props: { access_token },
    };
  }

  const { query } = context;
  const token = query.token;
  if (!token || token == '')
    return {
      redirect: {
        permanent: true,
        destination: '/login',
      },
      props: { token },
    };
  return {
    props: { token },
  };
}

export default LoginCallback;
