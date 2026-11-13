import React from 'react';
import { Route, Routes } from 'react-router';
import './App.css';

import { AppShell } from '@mantine/core';

import CalendarPage from "./pages/CalendarPage";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import PlansPage from "./pages/PlansPage";
import PlansDetailPage from "./pages/PlansDetailPage";
import ProgressPage from "./pages/ProgressPage";
import ProtectedRoute from './auth/ProtectedRoute';
import RegisterPage from "./pages/RegisterPage";
import SessionsPage from "./pages/SessionsPage";
import SessionsFormPage from "./pages/SessionFormPage";


const App : React.FC = () : React.ReactElement => {
  return (
    <>
      <AppShell padding="md"
        header={{ height: 60, offset: true }}
      >
      <AppShell.Main>
      <Routes>
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/progress" element={<ProgressPage />} />
          <Route path="/sessions" element={<SessionsPage />} />
          <Route path="/sessions/new" element={<SessionsFormPage />} />
          <Route path="/sessions/:sessionId/edit" element={<SessionsFormPage />} />
          <Route path="/plans" element={<PlansPage />} />
          <Route path="/plans/:planId" element={<PlansDetailPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
        </Route>

      </Routes>
      </AppShell.Main>
      </AppShell>

    </>
  );
};

export default App;