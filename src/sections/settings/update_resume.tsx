import React, { useEffect, useState } from 'react';
import Toaster from '@/utils/toaster';
import patchHandler from '@/handlers/patch_handler';
import { useDispatch, useSelector } from 'react-redux';
import { userSelector } from '@/slices/userSlice';
import { SERVER_ERROR } from '@/config/errors';
import { FilePdf, FileText } from '@phosphor-icons/react';
import { setResume } from '@/slices/userSlice';
import Link from 'next/link';
import { APPLICATION_RESUME_URL } from '@/config/routes';

interface Props {
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
}

const UpdateResume = ({ setShow }: Props) => {
  const [mutex, setMutex] = useState(false);
  const [newResume, setNewResume] = useState<File>();

  const user = useSelector(userSelector);

  const regex = new RegExp(`${user.id}-(.*?)-\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}Z`);
  const match = regex.exec(user.resume);

  const dispatch = useDispatch();

  const handleSubmit = async () => {
    if (mutex || !newResume) return;

    setMutex(true);
    const toaster = Toaster.startLoad('Updating your Resume...');

    const URL = `/users/update_resume`;

    const formData = new FormData();
    formData.append('resume', newResume);

    const res = await patchHandler(URL, formData, 'multipart/form-data');

    if (res.statusCode === 200) {
      Toaster.stopLoad(toaster, 'Resume Updated!', 1);
      dispatch(setResume(res.data.resume || ''));
      setShow(false);
    } else {
      if (res.data.message) Toaster.stopLoad(toaster, res.data.message, 0);
      else {
        Toaster.stopLoad(toaster, SERVER_ERROR, 0);
      }
    }
    setMutex(false);
  };

  useEffect(() => {
    if (document.documentElement.style.overflowY == 'auto') {
      document.documentElement.style.overflowY = 'hidden';
      document.documentElement.style.height = '100vh';

      return () => {
        document.documentElement.style.overflowY = 'auto';
        document.documentElement.style.height = 'auto';
      };
    }
  }, []);

  return (
    <>
      <div className="w-1/3 h-fit max-md:w-5/6 max-md:h-fit fixed backdrop-blur-xl bg-white dark:bg-[#ffe1fc22] z-50 max-lg:z-[100] translate-x-1/2 -translate-y-1/4 top-56 right-1/2 flex flex-col font-primary p-8 max-md:p-4 gap-8 border-2 border-gray-500 dark:border-dark_primary_btn animate-fade_third rounded-xl">
        <input
          type="file"
          id="resume"
          className="hidden"
          multiple={false}
          onChange={({ target }) => {
            if (target.files && target.files[0]) {
              const file = target.files[0];
              if (file.type.split('/')[1] == 'pdf') {
                setNewResume(file);
              } else Toaster.error('Only PDF Files can be selected');
            }
          }}
        />
        {user.resume != '' ? (
          <div>
            Current Resume:{' '}
            <Link
              href={`${APPLICATION_RESUME_URL}/${user.resume}`}
              target="_blank"
              className="font-medium hover:underline hover:underline-offset-2"
            >
              {match ? match[1] : user.resume}
            </Link>
          </div>
        ) : (
          <div className="w-full text-center">You have not uploaded any resume</div>
        )}

        <label className="w-full" htmlFor="resume">
          <div
            className={`w-full rounded-lg py-2 relative flex-center flex-col cursor-pointer border-[1px] border-primary_btn  dark:border-dark_primary_btn transition-ease-300 ${
              !newResume ? 'hover:bg-primary_comp' : ''
            }`}
          >
            {!newResume ? (
              <>
                <FilePdf size={32} />
                <div className="">{user.resume != '' ? 'Change Resume' : 'Add Resume'}</div>
              </>
            ) : (
              <div className="w-full flex justify-between items-center px-4">
                <div className="flex items-center gap-2">
                  <FileText size={32} />
                  <div className="w-full text-center text-sm text-ellipsis overflow-hidden">{newResume.name}</div>
                </div>

                <div onClick={() => setNewResume(undefined)} className="p-2 cursor-pointer">
                  X
                </div>
              </div>
            )}
          </div>
        </label>
        {!newResume ? (
          <></>
        ) : (
          <button
            onClick={handleSubmit}
            className="w-1/3 max-md:w-1/2 mx-auto bg-slate-100 border-2 text-black border-[#1f1f1f] hover:text-white py-1 rounded-xl text-xl hover:bg-[#1f1f1f] transition-ease-200"
          >
            Submit
          </button>
        )}
      </div>

      <div
        onClick={() => setShow(false)}
        className=" bg-backdrop w-screen h-screen backdrop-blur-sm fixed top-0 right-0 animate-fade_third z-30 max-lg:z-[90]"
      ></div>
    </>
  );
};

export default UpdateResume;
