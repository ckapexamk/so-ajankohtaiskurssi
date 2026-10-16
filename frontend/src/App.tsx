import React from 'react';
import { Route, Routes } from 'react-router';
import './App.css';

import ProtectedRoute from './auth/ProtectedRoute';
import HomePage from "./pages/HomePage";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import SessionsPage from "./pages/SessionsPage";
import SessionsFormPage from "./pages/SessionFormPage";

const App : React.FC = () : React.ReactElement => {
  return (
    <>
      <Routes>
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/sessions" element={<SessionsPage />} />
          <Route path="/sessions/new" element={<SessionsFormPage />} />
        </Route>
      </Routes>
    </>
  );
};

export default App;