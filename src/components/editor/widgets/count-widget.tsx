const CountWidget = ({
  charCount,
  limit,
  className,
}: {
  charCount: number;
  limit: number; 
  className?: string;
})=>{
  const fillPercentage = Math.min(100, Math.max(0, charCount / limit * 100));
  return (
    <div className={`character-count w-fit flex items-center gap-2 ${charCount === limit ? 'character-count--warning' : ''} ${className}`}>  
      <div className="text-xs text-slate-500">
        {charCount} / {limit} characters 
      </div>  
    </div>
  )
}

export default CountWidget;