import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import MainLayout from '../layouts/MainLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import ProtectedRoute from './ProtectedRoute';

// Public Pages
import HomePage from '../pages/public/HomePage';
import AboutPage from '../pages/public/AboutPage';
import HowItWorksPage from '../pages/public/HowItWorksPage';
import ContactPage from '../pages/public/ContactPage';
import LoginPage from '../pages/public/LoginPage';
import RegisterPage from '../pages/public/RegisterPage';
import NotFoundPage from '../pages/public/NotFoundPage';

// Citizen (User) Pages
import UserDashboard from '../pages/user/UserDashboard';
import CreateComplaintPage from '../pages/user/CreateComplaintPage';
import MyComplaintsPage from '../pages/user/MyComplaintsPage';
import ComplaintDetailPage from '../pages/user/ComplaintDetailPage';
import ProfilePage from '../pages/user/ProfilePage';
import SettingsPage from '../pages/user/SettingsPage';

// Worker Pages
import WorkerDashboard from '../pages/worker/WorkerDashboard';
import AssignedTasksPage from '../pages/worker/AssignedTasksPage';
import TaskDetailPage from '../pages/worker/TaskDetailPage';
import WorkHistoryPage from '../pages/worker/WorkHistoryPage';
import WorkerPerformancePage from '../pages/worker/WorkerPerformancePage';

// Admin Pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import ComplaintManagementPage from '../pages/admin/ComplaintManagementPage';
import UserManagementPage from '../pages/admin/UserManagementPage';
import WorkerManagementPage from '../pages/admin/WorkerManagementPage';
import CategoryManagementPage from '../pages/admin/CategoryManagementPage';
import AnalyticsPage from '../pages/admin/AnalyticsPage';
import ActivityLogsPage from '../pages/admin/ActivityLogsPage';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Pages with MainLayout */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/how-it-works" element={<HowItWorksPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/complaints/:id" element={<ComplaintDetailPage />} />
      </Route>

      {/* Citizen (User) Routes with DashboardLayout */}
      <Route
        element={
          <ProtectedRoute allowedRoles={['user', 'admin']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<UserDashboard />} />
        <Route path="/complaints/new" element={<CreateComplaintPage />} />
        <Route path="/my-complaints" element={<MyComplaintsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      {/* Service Provider (Worker) Routes with DashboardLayout */}
      <Route
        element={
          <ProtectedRoute allowedRoles={['worker', 'admin']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/worker/dashboard" element={<WorkerDashboard />} />
        <Route path="/worker/tasks" element={<AssignedTasksPage />} />
        <Route path="/worker/tasks/:id" element={<TaskDetailPage />} />
        <Route path="/worker/history" element={<WorkHistoryPage />} />
        <Route path="/worker/performance" element={<WorkerPerformancePage />} />
      </Route>

      {/* Admin Routes with DashboardLayout */}
      <Route
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/complaints" element={<ComplaintManagementPage />} />
        <Route path="/admin/complaints/:id" element={<ComplaintDetailPage />} />
        <Route path="/admin/users" element={<UserManagementPage />} />
        <Route path="/admin/workers" element={<WorkerManagementPage />} />
        <Route path="/admin/categories" element={<CategoryManagementPage />} />
        <Route path="/admin/analytics" element={<AnalyticsPage />} />
        <Route path="/admin/activity-logs" element={<ActivityLogsPage />} />
      </Route>

      {/* 404 Catch-All */}
      <Route element={<MainLayout />}>
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
