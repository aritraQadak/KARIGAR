import { createContext, useContext } from 'react';
export const ArtisanDirectoryContext = createContext(null);
export function useArtisanDirectory() {
  const directory = useContext(ArtisanDirectoryContext);
  if (!directory) throw new Error('Artisan directory must be used within its provider.');
  return directory;
}
