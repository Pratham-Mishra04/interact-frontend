import { userSelector } from '@/slices/userSlice';
import ModalWrapper from '@/wrappers/modal';
import { X } from '@phosphor-icons/react';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from '@/components/ui/input-otp';

interface Props {
  handleSubmit: ({}: any) => void;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  title?: string;
  subtitle?: string;
  confirmText?: string;
  email?: string;
}

const ConfirmOTP = ({
  handleSubmit,
  setShow,
  title = "Verify it's You",
  subtitle = 'Enter the One Time Password (OTP) sent to - ',
  confirmText = 'Confirm',
  email,
}: Props) => {
  const [OTP, setOTP] = useState('');

  const user = useSelector(userSelector);

  useEffect(() => {
    document.documentElement.style.overflowY = 'hidden';
    document.documentElement.style.height = '100vh';

    return () => {
      document.documentElement.style.overflowY = 'auto';
      document.documentElement.style.height = 'auto';
    };
  }, []);
  return (
    <ModalWrapper setShow={setShow} width="1/3" height="fit" blur={true} modalStyles={{ top: '40%' }}>
      <div className="w-full flex flex-col gap-2 max-lg:gap-0 rounded-lg p-2 font-primary">
        <div className="w-full flex justify-end">
          <X className="cursor-pointer" onClick={() => setShow(false)} size={32} />
        </div>
        <div className="w-full max-lg:h-56 lg:flex-1 flex flex-col gap-8">
          <div className="w-full flex flex-col gap-4">
            <div className="font-bold text-5xl text-gray-800 dark:text-white">{title}</div>
            <div className="font-medium text-sm">
              {subtitle} <span className="font-semibold">{email ?? user.email}</span>
            </div>
          </div>

          <InputOTP className="w-full" maxLength={6} value={OTP} onChange={value => setOTP(value)}>
            <InputOTPGroup className="w-full">
              <InputOTPSlot className="w-1/6 h-12" index={0} />
              <InputOTPSlot className="w-1/6 h-12" index={1} />
              <InputOTPSeparator />
              <InputOTPSlot className="w-1/6 h-12" index={2} />
              <InputOTPSlot className="w-1/6 h-12" index={3} />
              <InputOTPSeparator />
              <InputOTPSlot className="w-1/6 h-12" index={4} />
              <InputOTPSlot className="w-1/6 h-12" index={5} />
            </InputOTPGroup>
          </InputOTP>

          <div
            onClick={() => handleSubmit(OTP)}
            className="w-fit mx-auto text-center bg-primary_comp border-2 border-[#1f1f1f] dark:border-dark_primary_btn hover:text-white px-4 py-2 rounded-xl text-xl hover:bg-[#ab3232] cursor-pointer transition-ease-200"
          >
            {confirmText}
          </div>
        </div>
      </div>
    </ModalWrapper>
  );
};

export default ConfirmOTP;
