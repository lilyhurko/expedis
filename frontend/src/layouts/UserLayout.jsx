// layouts/UserLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import UserNavbar from '../components/UserNavbar.jsx';

function UserLayout() {
  return (
    <>
      <UserNavbar />
      <main>
        <Outlet />
      </main>
    </>
  );
}

export default UserLayout;
