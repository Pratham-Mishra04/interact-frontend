import deleteHandler from "@/handlers/delete_handler"
import Toaster from "@/utils/toaster"
import patchHandler from "@/handlers/patch_handler"
import { useState } from "react"
import Tags from "@/components/utils/edit_tags"
import { Cross } from "@phosphor-icons/react"
import Image from "next/image"
import { SERVER_ERROR } from "@/config/errors"
import { Opening } from "@/types"
import { title } from "process"
import { initialOpening } from "@/types/initials"
interface Props{
    setClickedOnOpening:React.Dispatch<React.SetStateAction<boolean>>
    openingId:string,
    clickedOpening:Opening ,
    opening:Opening[],
    setOpening:React.Dispatch<React.SetStateAction<any[]>>,
    setClickedOpening:React.Dispatch<React.SetStateAction<Opening>>
}
const ViewOpening= (props:Props)=>{
  //todo: update data state on deletion and update openingClicked on editing
    const [description,setDescription]=useState<string>('')
    const [tags,setTags]=useState<string[]>([])
    const [active,setActive]=useState<boolean>(false)
    const [deletedOpeningId,setDeletedOpeningId]=useState<string>("");
    const orgId=props.clickedOpening?.organizationID;
    const handleButtonClick=async (e:any)=>{
        const type=e.target.dataset.type;
        const URL=`org/${orgId}/orgopenings/${props.openingId}`;
        const formData=new FormData();
        formData.append('description',description)
        tags.forEach((tag:string)=>{
          formData.append('tags',tag)
        })
        formData.append('active',active.toString())

        if(type=='edit'){
        if(description=='' || tags.length<3){
            Toaster.error('Cant be empty')
            return;
          }
        const res=await patchHandler(URL,formData,'multipart/formdata')
        if (res.statusCode === 200) {
           props.setClickedOpening(prev=>{
            if(prev){
              prev.description=description
              prev.title=title
              prev.tags=tags
            }  
            return (prev)
          })       
        } else {
          if (res.data.message) Toaster.error(res.data.message, 'error_toaster');
          else {
            Toaster.error(SERVER_ERROR, 'error_toaster');
          }
        }
          return;
        }

        const res= await deleteHandler(URL);
        const toaster=Toaster.startLoad('Deleting...')
        if (res.statusCode === 204) {
          Toaster.stopLoad(toaster, 'Deleted', 1);
          setDeletedOpeningId(props.openingId)
          props.setClickedOpening(initialOpening)
          props.setOpening(prev=>(prev.map((opening,index)=>{
            if(opening.id!=deletedOpeningId){
              return opening;
            }
          })))
        } else {
          Toaster.stopLoad(toaster, 'Internal Server Error.', 0);
        }
        

    }

return(
<div className="bg-[#fff] w-screen h-screen absolute z-[100]  text-[#000] gap-[1rem] flex flex-row justify-between items-center p-[2rem]  transition-all duration-200 ">
<Cross size={42}
        className="flex-center rounded-full hover:bg-white p-2 transition-ease-300 cursor-pointer  absolute top-0 right-0"
        weight="regular"
        onClick={()=>{props.setClickedOnOpening(false)}}
        color="black "/>
<Image width={100} height={100} src="/assets/base.svg" alt="qa" className="w-full h-full rounded-[2rem]  object-cover"/>
<div className="flex flex-col justify-around items-start gap-[1rem] w-[25%] h-screen">
  
        <div className="font-semibold text-lg">
          <div>
         Description: {props.clickedOpening?.description}
          </div>
          <div>
          Title: {props.clickedOpening?.title}
          </div>
          <div className="flex flex-row flex-wrap w-full gap-[1rem] font-regular ">
            Tags:
          {
            props.clickedOpening?.tags.map((tag:any,index:number)=>{
              return(
                <div className=" border-[2px] border-[#af7676] rounded-[0.2rem] p-[2px]">{tag}</div>
              )
            })
          }
          </div>
        </div>
        <div className="w-[100%] flex flex-col justify-center gap-[1rem]">
        <div>
                      <div className="text-xs ml-1 font-medium uppercase">
                        Opening Description ({description.trim().length}/100)
                      </div>
                      <input
                        value={description}
                        onChange={el => setDescription(el.target.value)}
                        maxLength={100}
                        type="text"
                        className="w-full font-medium bg-transparent focus:outline-none border-[1px] border-gray-1000 rounded-lg p-2"
                        placeholder="Update description here..."
                      />
         </div>
         <div>
                      <div className="text-xs ml-1 font-medium uppercase">
                        Opening Tags ({tags.length || 0}/10)
                      </div>
                      <Tags tags={tags} setTags={setTags} maxTags={10} />
         </div>
         <div className="flex flex-row-reverse justify-end items-center">
                      <div className="text-xs ml-1 font-medium uppercase">
                        Opening Activity Status
                      </div>
                      <input type="checkbox" name="True?" value={active.toString()} onChange={(e)=> setActive(e.target.checked)}/>
         </div>
        </div>
        <div className="flex flex-col w-[100%] kustify-center items-center gap-[1rem]">
        <button onClick={handleButtonClick} data-type="edit" className="w-full text-lg font-medium border-[1px] border-gray-1000 hover:bg-primary_comp_hover active:bg-primary_comp_active  dark:border-dark_primary_btn dark:active:bg-dark_primary_gradient_end py-2 flex-center hover:bg-gradient-to-r dark:hover:from-dark_secondary_gradient_start dark:hover:to-dark_secondary_gradient_end rounded-lg cursor-pointer transition-ease-300">
        Edit Opening
       </button>
       <button onClick={handleButtonClick} data-type="delete" className="w-full text-lg font-medium py-2 flex-center border-[1px] border-primary_danger hover:text-white hover:bg-primary_danger rounded-lg cursor-pointer transition-ease-300">
        Delete Opening
       </button>
        </div>
</div>    
</div>
)
}
export default ViewOpening;