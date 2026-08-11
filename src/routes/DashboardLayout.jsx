import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import AppHeader from '../components/AppHeader';
import { PackagePlus, Layers } from 'lucide-react';

export default function DashboardLayout() {
  return (
    <>
      <AppHeader title="Food Technologies App" />
      <div className="app-content">
        <Outlet />
      </div>
      <nav className="bottom-nav">
        <NavLink to="/" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`} end>
          <PackagePlus size={22} />
          <span>New Ad-ons</span>
        </NavLink>
        <NavLink to="/manage" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
          <Layers size={22} />
          <span>Manage</span>
        </NavLink>
      </nav>
    </>
  );
}