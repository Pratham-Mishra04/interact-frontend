import ModalWrapper from '@/wrappers/modal';
import React from 'react';
import { HackathonTrack } from '@/types';

type DisplayTracksProps = {
  tracks: HackathonTrack[] | null;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
};

const DisplayTracks: React.FC<DisplayTracksProps> = ({ tracks, setShow }) => {
  return (
    <ModalWrapper setShow={setShow} width="2/3" height="fit" blur={true} modalStyles={{ top: '50%' }}>
      <h1 className="text-3xl my-4 font-bold self-start">Tracks: </h1>
      <div className="flex flex-col space-y-4 w-full">
        {tracks?.map(track => (
          <div key={track.id} className="p-4 bg-white rounded-lg shadow-md w-full">
            <h3 className="text-xl font-bold">{track.title}</h3>
            <p className="text-gray-700">{track.description}</p>
          </div>
        ))}
      </div>
    </ModalWrapper>
  );
};

export default DisplayTracks;
