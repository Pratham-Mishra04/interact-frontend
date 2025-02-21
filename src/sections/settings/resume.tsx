import { SERVER_ERROR } from '@/config/errors';
import { APPLICATION_RESUME_URL } from '@/config/routes';
import patchHandler from '@/handlers/patch_handler';
import { setResume, userSelector } from '@/slices/userSlice';
import Toaster from '@/utils/toaster';
import { FilePdf, X } from '@phosphor-icons/react';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';

const Resume = () => {
  const [mutex, setMutex] = useState(false);
  const [resumeName, setResumeName] = useState('');

  const user = useSelector(userSelector);

  useEffect(() => {
    const regex = new RegExp(`${user.id}-(.*?)-\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}Z-(.*)`);
    const match = regex.exec(user.resume);

    setResumeName(match ? match[0] : user.resume);
  }, [user]);

  const dispatch = useDispatch();

  const handleSubmit = async (resume: File) => {
    if (mutex || !resume) return;

    setMutex(true);
    const toaster = Toaster.startLoad('Updating your Resume...');

    const URL = `/users/update_resume`;

    const formData = new FormData();
    formData.append('resume', resume);

    const res = await patchHandler(URL, formData, 'multipart/form-data');

    if (res.statusCode === 200) {
      Toaster.stopLoad(toaster, 'Resume Updated!', 1);
      dispatch(setResume(res.data.resume || ''));
    } else {
      if (res.data.message) Toaster.stopLoad(toaster, res.data.message, 0);
      else {
        Toaster.stopLoad(toaster, SERVER_ERROR, 0);
      }
    }
    setMutex(false);
  };

  return (
    <div className="w-full flex justify-between">
      <div>
        <div className="w-fit flex-center gap-2 text-lg font-semibold">
          Your Resume <FilePdf size={24} weight="duotone" />
        </div>
        {user.resume == '' ? (
          <div className="text-sm">Not Uploaded</div>
        ) : (
          <Link
            href={`${APPLICATION_RESUME_URL}/${user.resume}`}
            target="_blank"
            className="font-medium hover:underline hover:underline-offset-2"
          >
            {resumeName}
          </Link>
        )}
      </div>
      <input
        type="file"
        id="resume"
        className="hidden"
        multiple={false}
        onChange={({ target }) => {
          if (mutex) return;
          if (target.files && target.files[0]) {
            const file = target.files[0];
            if (file.type.split('/')[1] == 'pdf') {
              handleSubmit(file);
            } else Toaster.error('Only PDF files allowed');
          }
        }}
      />

      <label className="w-fit" htmlFor="resume">
        <div className="bg-white dark:bg-dark_primary_comp h-fit flex-center text-sm font-medium px-3 py-1 rounded-xl border-[1px] cursor-pointer">
          {mutex ? 'Uploading' : user.resume ? 'Update' : 'Upload'}
        </div>
      </label>
    </div>
  );
};

export default Resume;
