import React from 'react';
import { Route, Routes } from 'react-router';
import './App.css';

import ProtectedRoute from './auth/ProtectedRoute';
import DashboardPage from "./pages/DashboardPage";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import SessionsPage from "./pages/SessionsPage";
import SessionsFormPage from "./pages/SessionFormPage";
import PlansPage from "./pages/PlansPage";
import PlansDetailPage from "./pages/PlansDetailPage";
import CalendarPage from "./pages/CalendarPage";

const App : React.FC = () : React.ReactElement => {
  return (
    <>
      <Routes>
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/sessions" element={<SessionsPage />} />
          <Route path="/sessions/new" element={<SessionsFormPage />} />
          <Route path="/sessions/:sessionId/edit" element={<SessionsFormPage />} />
          <Route path="/plans" element={<PlansPage />} />
          <Route path="/plans/:planId" element={<PlansDetailPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
        </Route>
      </Routes>
    </>
  );
};

export default App;