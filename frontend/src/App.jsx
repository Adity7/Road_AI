import React from 'react';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Footer from './components/Footer';

export default function App() {
  return (
    <div className="bg-gray-900 text-gray-100 min-h-screen font-sans">
      <Header />
      <main className="p-4 md:p-8">
        <Dashboard />
      </main>
      <Footer />
    </div>
  );
}
