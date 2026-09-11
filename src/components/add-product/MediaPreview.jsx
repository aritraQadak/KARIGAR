import React from 'react';
export default function MediaPreview({ media, photo = false, label = 'Selected video' }) {
  return <div className="min-w-0 space-y-2">
    {photo ? <img src={media.previewUrl} alt={label} className="w-full aspect-square rounded-xl object-cover" /> :
      <video src={media.previewUrl} controls playsInline preload="metadata" aria-label={label} className="w-full max-h-72 rounded-xl bg-gray-950" />}
    <p className="text-xs text-gray-500 break-all">{media.file.name}{media.duration ? ` ? ${media.duration.toFixed(1)} seconds` : ''}</p>
  </div>;
}
