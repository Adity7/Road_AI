import React from 'react';
import { Video } from 'lucide-react';

function Header() {
  return (
    <header className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-10">
      <div className="container mx-auto px-4 md:px-8 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <Video className="text-cyan-400 h-8 w-8" />
          <h1 className="text-2xl font-bold tracking-tight text-white">Video Management System</h1>
        </div>
      </div>
    </header>
  );
}

export default Header;
