import React from 'react';
import ModalWrapper from '@/wrappers/modal';
import { HackathonPrize } from '@/types';

type DisplayPrizesProps = {
  prizes: HackathonPrize[] | null;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
};

const DisplayPrizes: React.FC<DisplayPrizesProps> = ({ prizes, setShow }) => {
  return (
    <ModalWrapper setShow={setShow} width="2/3" height="fit" blur={true} modalStyles={{ top: '50%' }}>
      <h1 className="text-3xl my-4 font-bold self-start">Prizes: </h1>
      <div className="flex flex-col space-y-4 w-full">
        {prizes?.map(prize => (
          <div key={prize.id} className="p-4 bg-white rounded-lg shadow-md w-full">
            <h3 className="text-xl font-bold">{prize.title}</h3>
            <p className="text-gray-700">{prize.description}</p>
          </div>
        ))}
      </div>
    </ModalWrapper>
  );
};

export default DisplayPrizes;
