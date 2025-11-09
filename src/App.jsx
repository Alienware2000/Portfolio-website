import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Home from "./components/Home.jsx";
import ProjectDetail from "./components/ProjectDetail.jsx";
import Atmosphere from "./components/Atmosphere.jsx";
import Navbar from "./components/Navbar.jsx";

function Shell() {
  const location = useLocation();
  const showNavbar = location.pathname === "/";
  return (
    <>
      <Atmosphere />
      {showNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/project/:slug" element={<ProjectDetail />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Shell />
    </BrowserRouter>
  );
}
