import React from 'react';
import Time from '@/components/form/time';
import { getInputFieldFormatTime } from '@/utils/funcs/time';
import { Hackathon } from '@/types';

interface TeamsProps {
  minTeamSize: number;
  setMinTeamSize: (value: number) => void;
  maxTeamSize: number;
  setMaxTeamSize: (value: number) => void;
  teamFormationStartTime: Date;
  setTeamFormationStartTime: (value: string) => void;
  teamFormationEndTime: Date;
  setTeamFormationEndTime: (value: string) => void;
  onSave?: (data: Partial<Hackathon>) => void;
}

const Teams: React.FC<TeamsProps> = ({
  minTeamSize,
  setMinTeamSize,
  maxTeamSize,
  setMaxTeamSize,
  teamFormationStartTime,
  setTeamFormationStartTime,
  teamFormationEndTime,
  setTeamFormationEndTime,
  onSave,
}) => {
  const handleMinTeamSizeChange = (value: number) => {
    setMinTeamSize(value);
  };

  const handleMaxTeamSizeChange = (value: number) => {
    setMaxTeamSize(value);
  };

  const handleTeamFormationStartTimeChange = (value: string) => {
    setTeamFormationStartTime(value);
  };

  const handleTeamFormationEndTimeChange = (value: string) => {
    setTeamFormationEndTime(value);
  };

  const handleSave = () => {
    const updatedData: Partial<Hackathon> = {
      teamFormationStartTime,
      teamFormationEndTime,
      minTeamSize,
      maxTeamSize,
    };

    if (onSave) onSave(updatedData);
  };

  return (
    <div className="w-full flex flex-col gap-2">
      <div className="w-full">
        <div className="text-xs ml-1 font-medium uppercase text-gray-500">Min Team Size*</div>
        <input
          value={minTeamSize}
          onChange={el => handleMinTeamSizeChange(Number(el.target.value))}
          type="number"
          className="w-full font-medium bg-transparent focus:outline-none border-[1px] border-gray-400 rounded-lg p-2"
        />
      </div>
      <div className="w-full">
        <div className="text-xs ml-1 font-medium uppercase text-gray-500">Max Team Size*</div>
        <input
          value={maxTeamSize}
          onChange={el => handleMaxTeamSizeChange(Number(el.target.value))}
          type="number"
          className="w-full font-medium bg-transparent focus:outline-none border-[1px] border-gray-400 rounded-lg p-2"
        />
      </div>
      <Time
        label="Team Formation Start Time"
        val={getInputFieldFormatTime(teamFormationStartTime)}
        setVal={handleTeamFormationStartTimeChange}
        includeDate={true}
      />
      <Time
        label="Team Formation End Time"
        val={getInputFieldFormatTime(teamFormationEndTime)}
        setVal={handleTeamFormationEndTimeChange}
        includeDate={true}
      />
      {onSave && (
        <button
          onClick={handleSave}
          className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-all duration-200 flex items-center gap-2 w-fit"
        >
          Save Changes
        </button>
      )}
    </div>
  );
};

export default Teams;
