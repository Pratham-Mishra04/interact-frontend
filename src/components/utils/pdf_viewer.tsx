import ModalWrapper from '@/wrappers/modal';
import React, { useEffect, useState } from 'react';
import { SERVER_ERROR } from '@/config/errors';
import getHandler from '@/handlers/get_handler';
import { currentOrgIDSelector } from '@/slices/orgSlice';
import Toaster from '@/utils/toaster';
import Cookies from 'js-cookie';
import { useSelector } from 'react-redux';
import Loader from '../common/loader';

interface Props {
  resourceID: string;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
}

const PDFViewer = ({ resourceID, setShow }: Props) => {
  const [loading, setLoading] = useState(true);
  const [dataURL, setDataURL] = useState('');

  const currentOrgID = useSelector(currentOrgIDSelector);

  const fetchPDF = () => {
    const URL = `/resources/${currentOrgID}/serve/${resourceID}?token=${Cookies.get('token')}`;
    getHandler(URL)
      .then(res => {
        if (res.statusCode === 200) {
          setDataURL('data:application/pdf;base64,' + res.data);
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
    fetchPDF();

    return () => {
      setDataURL('');
    };
  }, [resourceID]);

  return (
    <ModalWrapper setShow={setShow}>
      {loading ? (
        <Loader />
      ) : (
        <>
          <div>Hello There!</div>
          <iframe src={dataURL} style={{ width: '100%', height: '100%' }} />
        </>
      )}
    </ModalWrapper>
  );
};

export default PDFViewer;
