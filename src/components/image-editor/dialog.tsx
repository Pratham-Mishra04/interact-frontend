import React, { useRef, useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import ReactCrop, { centerCrop, makeAspectCrop, Crop, PixelCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css';
import { Button } from '@/components/ui/button';
import { LoaderCircle } from 'lucide-react';
import Toaster from '@/utils/toaster';

// Project, event

export const handleImageInputClick = (e: React.MouseEvent<HTMLInputElement, MouseEvent>) =>(e.target as HTMLInputElement).value = ''

export const handleImageInputChange = (
  event: React.ChangeEvent<HTMLInputElement> ,func: (file: File)=>void
)=>{
  const target = event.target;
  if (target.files && target.files[0]) {
    const file = target.files[0];
    if (file.type.split('/')[0] == 'image') {
      func(file);
    } else Toaster.error('Only Image Files can be selected');
  }
}

function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect: number) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight,
    ),
    mediaWidth,
    mediaHeight,
  )
}

interface ImageEditorDialogProps {
  open: boolean,
  setOpen: React.Dispatch<React.SetStateAction<boolean>>,
  handleUpdate: (file: File, view?: string)=>void,
  image: File,
  aspectRatio?: number,
  circularCrop?: boolean,
}

const ImageEditorDialog = ({
  open, setOpen,
  handleUpdate, image,
  aspectRatio = 1,
  circularCrop = false
}: ImageEditorDialogProps)=>{
  const imgRef = useRef<HTMLImageElement>(null)
  const [imgSrc, setImgSrc] = useState(URL.createObjectURL(image))
  const [crop, setCrop] = useState<Crop | null>(null)
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null)
  const [aspect, setAspect] = useState<number>(aspectRatio || 1)

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    if (aspect) {
      const { width, height } = e.currentTarget
      setCrop(centerAspectCrop(width, height, aspect))
    }
  }

  async function onApplyDefaultCrop() {
    if (!completedCrop) {
      if (imgRef.current) {
        const { width, height } = imgRef.current;
        setCrop(centerAspectCrop(width, height, aspect));
      }
    }
    await onSave();
  }

  async function onSave() {
    const image = imgRef.current
    if (!image || !completedCrop) {
      throw new Error('Crop parameters do not exist')
    }

    const scaleX = image.naturalWidth / image.width
    const scaleY = image.naturalHeight / image.height

    const offscreen = document.createElement("canvas");

    offscreen.width = completedCrop.width * scaleX;
    offscreen.height = completedCrop.height * scaleY;


    const ctx = offscreen.getContext('2d')
    if (!ctx) {
      throw new Error('No 2d context')
    }

    const cropX = completedCrop.x * scaleX
    const cropY = completedCrop.y * scaleY
    const centerX = image.naturalWidth / 2
    const centerY = image.naturalHeight / 2

    ctx.save()
    ctx.translate(-cropX, -cropY)
    ctx.translate(centerX, centerY)
    ctx.translate(-centerX, -centerY)
    ctx.drawImage(
      image,
      0,
      0,
      image.naturalWidth,
      image.naturalHeight,
      0,
      0,
      image.naturalWidth,
      image.naturalHeight,
    )
    ctx.restore()

    const dataURL = offscreen.toDataURL('image/png')

    const blob = await new Promise<Blob>((resolve, reject) =>
      offscreen.toBlob((blob) => {
        if (blob) resolve(blob)
        else reject(new Error("Failed to create Blob"))
      }, "image/png")
    )

    const fileName = `${crypto.randomUUID()}.png`;
    const file = new File([blob], fileName, { type: "image/png" });

    handleUpdate(file, dataURL);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Image</DialogTitle>
          <div>
            {!!imgSrc && (
              <ReactCrop
                crop={crop || undefined}
                onChange={(_, percentCrop) => setCrop(percentCrop)}
                onComplete={(c) => setCompletedCrop(c)}
                className="max-w-screen-lg max-h-96"
                aspect={aspect}
                maxHeight={500}
                maxWidth={500}
                circularCrop={circularCrop}
              >
                <img
                  ref={imgRef}
                  alt="Crop me"
                  src={imgSrc}
                  // style={{ transform: `scale(${scale}) rotate(${rotate}deg)` }}
                  onLoad={onImageLoad}
                />
              </ReactCrop>
            )}
            {!imgSrc && (
              <div className={"w-full flex-center min-h-28"}>
                <LoaderCircle className={"animate-spin"} />
              </div>
            )}
            {!!completedCrop && (
              <div className={"mt-1"}>
                <Button className={"w-1/3 rounded-xl bg-blue-500 hover:bg-blue-400 dark:bg-blue-500 dark:hover:bg-blue-400"} onClick={onSave}>Save</Button>
              </div>
            )}
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}

export default ImageEditorDialog;