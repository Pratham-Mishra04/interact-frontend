import { ORG_URL, USER_PROFILE_PIC_URL } from '@/config/routes';
import postHandler from '@/handlers/post_handler';
import { Organization, OrganizationMembership, Team } from '@/types';
import Toaster from '@/utils/toaster';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { MagnifyingGlass } from '@phosphor-icons/react';
import { SERVER_ERROR } from '@/config/errors';
import { currentOrgSelector, setCurrentOrgTeams } from '@/slices/orgSlice';
import { useSelector } from 'react-redux';
import { initialTeam } from '@/types/initials';
import PrimaryButton from '@/components/buttons/primary_btn';
import Input from '@/components/form/input';
import TextArea from '@/components/form/textarea';
import Tags from '@/components/form/tags';
import Color from '@/components/form/color';
import { useDispatch } from 'react-redux';

interface Props {
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  organization: Organization;
  setOrganization: React.Dispatch<React.SetStateAction<Organization>>;
}

const NewTeam = ({ setShow, organization, setOrganization }: Props) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#8ED1FC');
  const [tags, setTags] = useState<string[]>([]);

  const [memberships, setMemberships] = useState<OrganizationMembership[]>([]);
  const [search, setSearch] = useState('');

  const [status, setStatus] = useState(0);
  const [mutex, setMutex] = useState(false);

  const [selectedMemberships, setSelectedMemberships] = useState<OrganizationMembership[]>([]);
  const [team, setTeam] = useState(initialTeam);

  const currentOrg = useSelector(currentOrgSelector);

  const dispatch = useDispatch();

  const handleChange = (el: React.ChangeEvent<HTMLInputElement>) => {
    fetchMemberships(el.target.value);
    setSearch(el.target.value);
  };

  const fetchMemberships = async (key: string) => {
    const matchedMemberships: OrganizationMembership[] = [];

    organization.memberships.forEach(membership => {
      if (membership.user.username.match(new RegExp(key, 'i'))) matchedMemberships.push(membership);
      else if (membership.user.name.match(new RegExp(key, 'i'))) matchedMemberships.push(membership);
    });

    setMemberships(matchedMemberships);
  };

  useEffect(() => {
    fetchMemberships('');
  }, []);

  const handleClickMembership = (membership: OrganizationMembership) => {
    if (selectedMemberships.includes(membership)) {
      setSelectedMemberships(prev => prev.filter(m => m.id != membership.id));
    } else {
      setSelectedMemberships(prev => [...prev, membership]);
    }
  };

  const handleSubmit = async () => {
    if (title.trim().length == 0) {
      Toaster.error('Title cannot be empty');
      return;
    }

    if (mutex) return;
    setMutex(true);

    const toaster = Toaster.startLoad('Creating a new team');

    const URL = `${ORG_URL}/${currentOrg.id}/teams`;

    const formData = {
      title,
      description,
      color,
      tags,
    };

    const res = await postHandler(URL, formData);
    if (res.statusCode === 201) {
      const teamData: Team = res.data.team;
      setTeam(teamData);
      setOrganization(prev => {
        return {
          ...prev,
          teams: [...(prev.teams || []), teamData],
        };
      });
      dispatch(setCurrentOrgTeams([...(currentOrg.teams || []), teamData]));
      Toaster.stopLoad(toaster, 'New Team Added!', 1);
      return 1;
    } else {
      if (res.data.message) Toaster.stopLoad(toaster, res.data.message, 0);
      else {
        Toaster.stopLoad(toaster, SERVER_ERROR, 0);
      }
      setMutex(false);
      return 0;
    }
  };

  const handleAddMemberships = async () => {
    const toaster = Toaster.startLoad('Adding Users');

    const URL = `${ORG_URL}/${currentOrg.id}/teams/users/${team.id}`;

    const users = selectedMemberships.map(membership => membership.user);
    var counter = 0;
    for (const user of users) {
      const formData = {
        userID: user.id,
        teamID: team.id,
      };

      const res = await postHandler(URL, formData);
      if (res.statusCode == 200) {
        counter++;
      } else {
        if (res.data.message) Toaster.stopLoad(toaster, `${user.name}: ${res.data.message}`, 0);
        else {
          Toaster.stopLoad(toaster, SERVER_ERROR, 0);
        }
      }
    }

    const userIDs = users.map(user => user.id);

    setOrganization(prev => {
      return {
        ...prev,
        teams: prev.teams.map(t => {
          if (t.id == team.id)
            return {
              ...t,
              noUsers: t.noUsers + counter,
            };
          return t;
        }),
        memberships: prev.memberships.map(m => {
          if (userIDs.includes(m.userID)) return { ...m, teams: [...(m.teams || []), team] };
          return m;
        }),
      };
    });
    dispatch(
      setCurrentOrgTeams(
        currentOrg.teams.map(t => {
          if (t.id == team.id)
            return {
              ...t,
              noUsers: t.noUsers + counter,
            };
          return t;
        })
      )
    );

    Toaster.stopLoad(toaster, 'Users Added!', 1);
    setShow(false);
  };

  return (
    <>
      <div className="fixed top-24 max-md:top-20 w-[640px] max-md:w-5/6 backdrop-blur-2xl bg-white dark:bg-dark_primary_comp flex flex-col gap-4 rounded-lg p-10 max-md:p-5 dark:text-white font-primary border-[1px] border-primary_btn  dark:border-dark_primary_btn right-1/2 translate-x-1/2 animate-fade_third z-50">
        <div className="text-3xl max-md:text-xl font-semibold">
          {status == 0 ? 'Team Info' : status == 1 ? 'Select Users' : 'Review Details'}
        </div>
        <div className="w-full h-[420px] overflow-y-auto flex flex-col gap-4">
          {status == 0 ? (
            <div className="w-full flex flex-col gap-4">
              <Input label="Team Title" val={title} setVal={setTitle} maxLength={50} required={true} />
              <TextArea label="Team Description" val={description} setVal={setDescription} maxLength={500} />
              <Tags label="Team Tags" tags={tags} setTags={setTags} maxTags={5} />
              <Color label="Team Color" val={color} setVal={color => setColor(color.hex)} />
            </div>
          ) : (
            <>
              <div className="w-full h-12 flex items-center px-4 gap-4 dark:bg-dark_primary_comp_hover rounded-md">
                <MagnifyingGlass size={24} />
                <input
                  className="grow bg-transparent focus:outline-none font-medium"
                  placeholder="Search"
                  value={search}
                  onChange={handleChange}
                />
              </div>
              <div className="w-full flex-1 flex flex-col gap-2 overflow-y-auto">
                {memberships.map(membership => {
                  return (
                    <div
                      key={membership.user.id}
                      onClick={() => handleClickMembership(membership)}
                      className={`w-full flex gap-2 rounded-lg p-2 ${
                        selectedMemberships.includes(membership)
                          ? 'dark:bg-dark_primary_comp_active bg-primary_comp_hover'
                          : 'dark:bg-dark_primary_comp hover:bg-primary_comp dark:hover:bg-dark_primary_comp_hover'
                      } cursor-pointer transition-ease-200`}
                    >
                      <Image
                        crossOrigin="anonymous"
                        width={50}
                        height={50}
                        alt={'User Pic'}
                        src={`${USER_PROFILE_PIC_URL}/${membership.user.profilePic}`}
                        className={'rounded-full w-12 h-12 cursor-pointer border-[1px] border-black'}
                      />
                      <div className="w-5/6 flex flex-col">
                        <div className="text-lg font-bold">{membership.user.name}</div>
                        <div className="text-sm dark:text-gray-200">@{membership.user.username}</div>
                        {membership.user.tagline && membership.user.tagline != '' && (
                          <div className="text-sm mt-2">{membership.user.tagline}</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
        <div className="w-full flex justify-end">
          {status == 0 ? (
            <PrimaryButton
              onClick={async () => {
                if ((await handleSubmit()) == 1) setStatus(1);
              }}
              label="Submit"
              animateIn={false}
            />
          ) : (
            <PrimaryButton onClick={handleAddMemberships} label="Submit" animateIn={false} />
          )}
        </div>
      </div>

      <div
        onClick={() => setShow(false)}
        className="bg-backdrop w-screen h-screen fixed top-0 left-0 animate-fade_third z-20"
      ></div>
    </>
  );
};

export default NewTeam;
