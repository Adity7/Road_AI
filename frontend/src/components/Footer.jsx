import React from 'react';

function Footer() {
  return (
    <footer className="text-center py-4 mt-8 border-t border-gray-800">
      <p className="text-sm text-gray-500">&copy; {new Date().getFullYear()} VMS Dashboard. All rights reserved.</p>
    </footer>
  );
}

export default Footer;
