import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Studio from './components/Studio';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfService from './components/TermsOfService';

const App: React.FC = () => {
  return (
    <Routes>
      {/* Main Studio App */}
      <Route path="/" element={<Studio />} />

      {/* Pages */}
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/terms" element={<TermsOfService />} />

      {/* Wildcard redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;