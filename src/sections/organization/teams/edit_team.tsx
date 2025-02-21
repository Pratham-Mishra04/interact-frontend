import { ORG_URL } from '@/config/routes';
import { Organization, Team } from '@/types';
import Toaster from '@/utils/toaster';
import React, { useState } from 'react';
import { SERVER_ERROR } from '@/config/errors';
import { currentOrgIDSelector, currentOrgSelector, setCurrentOrgTeams } from '@/slices/orgSlice';
import { useSelector } from 'react-redux';
import PrimaryButton from '@/components/buttons/primary_btn';
import TextArea from '@/components/form/textarea';
import patchHandler from '@/handlers/patch_handler';
import Tags from '@/components/form/tags';
import Color from '@/components/form/color';
import { useDispatch } from 'react-redux';

interface Props {
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  team: Team;
  setTeam: React.Dispatch<React.SetStateAction<Team>>;
  setOrganization: React.Dispatch<React.SetStateAction<Organization>>;
}

const EditTeam = ({ setShow, team, setTeam, setOrganization }: Props) => {
  const [description, setDescription] = useState(team.description);
  const [color, setColor] = useState(team.color);
  const [tags, setTags] = useState(team.tags || []);
  const [mutex, setMutex] = useState(false);

  const currentOrg = useSelector(currentOrgSelector);

  const dispatch = useDispatch();

  const handleSubmit = async () => {
    if (mutex) return;
    setMutex(true);

    const toaster = Toaster.startLoad('Editing team');

    const URL = `${ORG_URL}/${currentOrg.id}/teams/${team.id}`;

    const formData = {
      description,
      color,
      tags,
    };

    const res = await patchHandler(URL, formData);
    if (res.statusCode === 200) {
      setTeam(prev => {
        return { ...prev, description, color, tags };
      });
      setOrganization(prev => {
        return {
          ...prev,
          teams: prev.teams.map(t => {
            if (t.id == team.id)
              return {
                ...t,
                description,
                color,
                tags,
              };
            return t;
          }),
        };
      });
      dispatch(
        setCurrentOrgTeams(
          currentOrg.teams.map(t => {
            if (t.id == team.id)
              return {
                ...t,
                description,
                color,
                tags,
              };
            return t;
          })
        )
      );
      setShow(false);
      Toaster.stopLoad(toaster, 'Team Edited!', 1);
    } else {
      if (res.data.message) Toaster.stopLoad(toaster, res.data.message, 0);
      else {
        Toaster.stopLoad(toaster, SERVER_ERROR, 0);
      }
      setMutex(false);
    }
  };

  return (
    <>
      <div className="fixed top-24 max-md:top-20 w-[640px] max-md:w-5/6 backdrop-blur-2xl bg-white dark:bg-dark_primary_comp flex flex-col gap-4 rounded-lg p-10 max-md:p-5 dark:text-white font-primary border-[1px] border-primary_btn  dark:border-dark_primary_btn right-1/2 translate-x-1/2 animate-fade_third z-50">
        <div className="text-3xl max-md:text-xl font-semibold">{team.title}</div>
        <div className="w-full h-[420px] overflow-y-auto flex flex-col gap-4">
          <div className="w-full flex flex-col gap-4">
            <TextArea label="Team Description" val={description} setVal={setDescription} maxLength={500} />
            <Tags label="Team Tags" tags={tags} setTags={setTags} maxTags={5} />
            <Color label="Team Color" val={color} setVal={color => setColor(color.hex)} />
          </div>
        </div>
        <div className="w-full flex justify-end">
          <PrimaryButton onClick={handleSubmit} label="Submit" animateIn={false} />
        </div>
      </div>

      <div
        onClick={() => setShow(false)}
        className="bg-backdrop w-screen h-screen fixed top-0 left-0 animate-fade_third z-20"
      ></div>
    </>
  );
};

export default EditTeam;
