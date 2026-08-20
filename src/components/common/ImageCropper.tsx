import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { cn } from '../../lib/utils';
import { X, Check } from 'lucide-react';

interface ImageCropperProps {
  imageSrc: string;
  onCropComplete: (croppedImageBlob: Blob, cropData: { crop: { x: number; y: number }; zoom: number; croppedAreaPixels: any }) => void;
  onCancel: () => void;
  isDarkMode: boolean;
  initialCrop?: { x: number; y: number };
  initialZoom?: number;
}

export function ImageCropper({ imageSrc, onCropComplete, onCancel, isDarkMode, initialCrop = { x: 0, y: 0 }, initialZoom = 1 }: ImageCropperProps) {
  const [crop, setCrop] = useState(initialCrop);
  const [zoom, setZoom] = useState(initialZoom);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  const onCropChange = (crop: { x: number; y: number }) => {
    setCrop(crop);
  };

  const onZoomChange = (zoom: number) => {
    setZoom(zoom);
  };

  const onCropCompleteHandler = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSave = async () => {
    try {
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
      onCropComplete(croppedImage, { crop, zoom, croppedAreaPixels });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
      <div className={cn(
        "w-full max-w-2xl rounded-2xl p-6 shadow-2xl flex flex-col gap-4 relative border",
        isDarkMode ? "bg-[#14161C] border-white/10 text-white" : "bg-white text-neutral-900 border-neutral-200"
      )}>
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-bold text-lg">Reposition Image</h3>
          <button onClick={onCancel} className={cn("p-1.5 rounded transition-colors border", isDarkMode ? "bg-white/5 hover:bg-white/10 border-white/10" : "bg-neutral-100 hover:bg-neutral-200 border-neutral-200")}>
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="relative w-full h-[60vh] bg-black rounded-lg overflow-hidden border border-white/10">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={2 / 3}
            onCropChange={onCropChange}
            onCropComplete={onCropCompleteHandler}
            onZoomChange={onZoomChange}
            showGrid={false}
          />
        </div>

        <div className="flex flex-col gap-2 mt-4">
          <label className={cn("text-[10px] font-bold uppercase tracking-widest", isDarkMode ? "text-white/70" : "text-neutral-600")}>Zoom</label>
          <input
            type="range"
            value={zoom}
            min={1}
            max={3}
            step={0.1}
            aria-labelledby="Zoom"
            onChange={(e) => {
              setZoom(Number(e.target.value));
            }}
            className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-white/10">
          <button onClick={onCancel} className={cn("px-4 py-2 rounded font-semibold text-xs transition-colors", isDarkMode ? "text-white/70 hover:text-white hover:bg-white/5" : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100")}>Cancel</button>
          <button onClick={handleSave} className="bg-[#3B82F6] hover:bg-[#2563EB] text-[#0A0B0E] px-6 py-2 rounded font-semibold transition-colors text-xs flex items-center gap-2">
            <Check className="w-3 h-3" /> Save Crop
          </button>
        </div>
      </div>
    </div>
  );
}

// Utility function to get cropped image
const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous'); 
    image.src = url;
  });

async function getCroppedImg(
  imageSrc: string,
  pixelCrop: { x: number; y: number; width: number; height: number }
): Promise<Blob> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('No 2d context');
  }

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob((file) => {
      if (file) {
        resolve(file);
      } else {
        reject(new Error('Canvas is empty'));
      }
    }, 'image/jpeg');
  });
}
