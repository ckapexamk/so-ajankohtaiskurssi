import React from 'react';
import { Route, Routes } from 'react-router';
import './App.css'

import HomePage from './pages/HomePage';

const App : React.FC = () : React.ReactElement => {
  return (
    <>
    <Routes>
        <Route path="/" element={<HomePage />} />
    </Routes>
    </>
  );
}

export default App
