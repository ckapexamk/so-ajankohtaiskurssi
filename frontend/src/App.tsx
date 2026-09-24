import React from 'react';
import { Route, Routes } from 'react-router';
import './App.css';

import HomePage from "./pages/HomePage";
import RegisterPage from "./pages/RegisterPage";

const App : React.FC = () : React.ReactElement => {
  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    </>
  );
};

export default App;