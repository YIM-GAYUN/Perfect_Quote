import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { createGlobalStyle } from "styled-components";
import { globalStyles } from "./styles/theme";
import QuoteGenerator from "./pages/QuoteGenerator";
import QuoteResult from "./pages/QuoteResult";
import AboutOverview from "./pages/AboutOverview";
import AboutValue from "./pages/AboutValue";
import AboutAnalysis from "./pages/AboutAnalysis";
import Ideas from "./pages/Ideas";
import Support from "./pages/Support";
import DesignSystem from "./pages/DesignSystem";
import Persona from "./pages/Persona";

const GlobalStyle = createGlobalStyle`
  ${globalStyles}
`;

const App: React.FC = () => {
  return (
    <Router>
      <GlobalStyle />
      <Routes>
        <Route path="/" element={<QuoteGenerator />} />
        <Route path="/result" element={<QuoteResult />} />
        <Route path="/about/overview" element={<AboutOverview />} />
        <Route path="/about/value" element={<AboutValue />} />
        <Route path="/about/analysis" element={<AboutAnalysis />} />
        <Route path="/ideas" element={<Ideas />} />
        <Route path="/support" element={<Support />} />
        <Route path="/design-system" element={<DesignSystem />} />
        <Route path="/persona" element={<Persona />} />
      </Routes>
    </Router>
  );
};

export default App;
