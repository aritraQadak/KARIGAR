import React from 'react';
import { Outlet } from 'react-router-dom';
import BuyerHeader from '../components/BuyerHeader';
import '../styles/buyerHeritage.css';
import BuyerFooter from '../components/BuyerFooter';
import { ArtisanDirectoryProvider } from '../components/ArtisanDirectoryProvider';

export default function BuyerLayout() {
  return (
    <ArtisanDirectoryProvider><div className="buyer-heritage min-h-screen flex flex-col bg-surface text-on-surface font-sans antialiased">
      <BuyerHeader />
      <main className="buyer-content flex-1 w-full">
        <Outlet />
      </main>
      <BuyerFooter />
    </div></ArtisanDirectoryProvider>
  );
}
