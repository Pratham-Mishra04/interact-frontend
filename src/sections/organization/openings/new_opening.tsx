import Tags from '@/components/utils/edit_tags';
import React, {useState} from 'react'
import Toaster from '@/utils/toaster';
import { useSelector } from 'react-redux';
import { currentOrgSelector } from '@/slices/orgSlice';
import postHandler from '@/handlers/post_handler';
import { Cross } from '@phosphor-icons/react';
import { Opening } from '@/types';
import { SERVER_ERROR } from '@/config/errors';
interface Props{
  setClickedOnNewOpening:React.Dispatch<React.SetStateAction<boolean>>;
  openings:Opening[],
  setOpenings:React.Dispatch<React.SetStateAction<Opening[]>>;
}
export default function NewOpening(props:Props){
    const [title,setTitle]= useState<string>('');
    const [description,setDescription]= useState<string>('');
    const [tags,setTags]= useState<string[]>([]);
    const currentOrg = useSelector(currentOrgSelector);

    const handleSubmit=async ()=>{
       const t= Toaster.startLoad('Submitting...')
        if(title.trim()==''){
            Toaster.error('Title can\'t be empty');
             return;
        }
        if(description.trim()==''){
            Toaster.error('Description can\'t be empty');
             return;
        }
        if(tags.length<3){
            Toaster.error('Atleast 3 tags');
             return;
        }
        const formData= new FormData();
        formData.append('title', title);
        formData.append('description', description);
        tags.forEach(tag => formData.append('tags', tag));
        const URL= `org/${currentOrg.id}/orgopenings`;
        const res= await postHandler(URL,formData,'multipart/form-data');
        if (res.statusCode === 201) {
         const addOpening=[...props.openings,res.data.opening]
        props.setOpenings(addOpening)
        Toaster.stopLoad(t,'Opening created',1)
        setDescription('')
        setTitle('')
        setTags([])  
        } else {
          if (res.data.message) Toaster.stopLoad(t, res.data.message, 0);
          else {
            Toaster.stopLoad(t, SERVER_ERROR, 0);
          }
        }
       

    }

  return (
    <div className="fixed top-[6rem] max-lg:top-0 w-5/6 max-lg:w-screen h-4/6 max-lg:h-screen backdrop-blur-2xl bg-white rounded-lg p-8 dark:text-white font-primary overflow-y-auto border-[1px] border-primary_btn  dark:border-dark_primary_btn right-1/2 translate-x-1/2 shadow-2xl animate-fade_third z-50 flex-col gap-[5rem]">
        <div className='w-full text-5xl max-lg:text-center max-lg:text-3xl font-bold bg-transparent focus:outline-none'>
            Add a new Opening
        </div>
        <Cross size={42}
        className="flex-center rounded-full hover:bg-white p-2 transition-ease-300 cursor-pointer  absolute top-0 right-0"
        weight="regular"
        onClick={()=>{props.setClickedOnNewOpening(false)
          setDescription('')
          setTitle('')
          setTags([]) 
        }
      }
        color="black "/>
         <div>
                      <div className="text-xs ml-1 font-medium uppercase text-gray-500">
                        Opening Tagline ({title.trim().length}/40)
                      </div>
                      <input
                        value={title}
                        onChange={el => setTitle(el.target.value)}
                        maxLength={40}
                        type="text"
                        className="w-full font-medium bg-transparent focus:outline-none border-[1px] border-gray-400 rounded-lg p-2"
                        placeholder="Write your Title here..."
                      />
         </div>
         <div>
                      <div className="text-xs ml-1 font-medium uppercase text-gray-500">
                      Opening Description ({description.trim().length}/1000)
                      </div>
                      <textarea
                        value={description}
                        onChange={el => setDescription(el.target.value)}
                        maxLength={1000}
                        className="w-full min-h-[80px] max-h-80 bg-transparent focus:outline-none border-[1px] border-gray-400 rounded-lg p-2"
                        placeholder="Explain your Opening"
                      />
         </div>
         <div>
                      <div className="text-xs ml-1 font-medium uppercase text-gray-500">
                      Opening Tags ({tags.length || 0}/10)
                      </div>
                      <Tags tags={tags} setTags={setTags} maxTags={10} />
         </div>
         <button className='w-fit text-lg py-2 font-medium px-4 shadow-md hover:bg-[#ffffff40] hover:shadow-lg transition-ease-500 rounded-xl cursor-pointer"' onClick={handleSubmit}>
            Submit
         </button>

        
    </div>
  )  
}