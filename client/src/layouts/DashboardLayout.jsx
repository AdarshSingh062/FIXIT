import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';
import ToastContainer from '../components/common/ToastContainer';

export const DashboardLayout = () => {
  return (
    <div className="app-container">
      <Navbar />
      <div className="dashboard-layout">
        <Sidebar />
        <main className="dashboard-content">
          <Outlet />
        </main>
      </div>
      <ToastContainer />
    </div>
  );
};

export default DashboardLayout;
