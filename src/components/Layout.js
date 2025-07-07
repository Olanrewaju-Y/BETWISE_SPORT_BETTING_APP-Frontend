import React from 'react';
// import Navbar from './Navbar';
import { Outlet } from 'react-router-dom';

const Layout = () => {
  return (
    <>
      {/* <Navbar /> */}
      <main style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}> {/* Ensure main content can grow */}
        <div style={{ flexGrow: 1 }}>
          <Outlet /> {/* Page content will be rendered here */}   
        </div>
      </main>
      {/* <Footer /> */}
    </>
  );
};
export default Layout;