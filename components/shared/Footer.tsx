
import React from 'react';
import { APP_NAME } from '../../constants';

const Footer: React.FC = () => {
  return (
    <footer className="bg-darkgray text-white text-center p-6 mt-12">
      <p>&copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.</p>
      <p className="text-sm mt-1">Empowering Student Volunteers, Together.</p>
    </footer>
  );
};

export default Footer;
