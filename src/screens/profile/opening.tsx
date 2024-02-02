import { useEffect, useState } from "react"
import ViewOpening from "@/sections/organization/openings/opening_view"
import getHandler from "@/handlers/get_handler"
import Toaster from "@/utils/toaster"
import { Opening } from "@/types"
import OpeningCard from "@/components/organization/opening_card"
import NewOpening from "@/sections/organization/openings/new_opening";
import checkOrgAccess from "@/utils/funcs/check_org_access"
import { ORG_MANAGER } from "@/config/constants"
import { SERVER_ERROR } from "@/config/errors"
import { initialOpening } from "@/types/initials"
interface Props{
    orgID:string
}

export default function Openings(props:Props){
    const[clickedOnNewOpening,setClickedOnNewOpening]=useState<boolean>(false) 
    const [openings,setOpenings]=useState<Opening[]>([]);
    const [clickedOnOpening,setClickedOnOpening]=useState<boolean>(false)
    const [clickedOnOpeningId,setClickedOnOpeningId]=useState<string>('');
    const [openingClicked,setOpeningClicked]=useState<Opening>(initialOpening)
    useEffect(()=>{
      const getOpenings=async()=>{
        const URL=`/org/${props.orgID}/orgopenings`
        const res= await getHandler(URL);
        if (res.statusCode === 200) {
          setOpenings(res.data.openings||[]) 
          return;
        } else {
          if (res.data.message) Toaster.error(res.data.message, 'error_toaster');
          else {
            Toaster.error(SERVER_ERROR, 'error_toaster');
          }
        }
      }
      getOpenings();    
    },[])
return (
  <>
  {
    clickedOnOpening && checkOrgAccess(ORG_MANAGER) ?(<ViewOpening setClickedOnOpening={setClickedOnOpening} openingId={openingClicked?.id ||'' } clickedOpening={openingClicked} opening={openings} setOpening={setOpenings} setClickedOpening={setOpeningClicked}/>):''
  }
  {
    clickedOnNewOpening && checkOrgAccess(ORG_MANAGER)?(<NewOpening setClickedOnNewOpening={setClickedOnNewOpening} openings={openings} setOpenings={setOpenings}/>):''
  }
<div className="w-full flex-row flex-wrap relative">
  
{checkOrgAccess(ORG_MANAGER)?(<div className="w-full px-2 pb-8 max-md:px-0 max-md:pb-2 z-50">
     <div
              onClick={() => setClickedOnNewOpening(true)}
              className={`mb-8 w-108 max-md:w-5/6 h-24 max-md:hover:scale-105 hover:scale-125 group relative overflow-clip bg-white hover:bg-[#f3f3f3] mx-auto border-[1px] pattern1 rounded-lg cursor-pointer flex-center flex-col transition-ease-300`}
            >
              <div className="backdrop-blur-md opacity-0 group-hover:opacity-60 w-2/3 h-2/3 rounded-xl transition-ease-out-300"></div>
              <div className="font-extrabold text-xl group-hover:text-2xl text-gradient absolute translate-y-0 group-hover:-translate-y-2 transition-ease-out-300">
                Create a new Opening!
              </div>
              <div className="text-xs font-semibold text-primary_black absolute translate-x-0 translate-y-16 group-hover:translate-y-4 transition-ease-out-300">
                Woohooh! New Opening! Who Dis?
              </div>
            </div>
</div>):''}
<div>
  {openings.map((opening:Opening,index:number)=>{
    return(<div>
     <OpeningCard setClickedOnOpening={setClickedOnOpening} openingId={opening.id} key={index} clickedOnOpening={clickedOnOpening} setClickedOnOpeningId={setClickedOnOpeningId} opening={opening} setOpeningClicked={setOpeningClicked}/>
    </div>)
  })}
</div>
</div>
</>
)
}