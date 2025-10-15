import "./App.css";
import Navbar from "./static/Navbar.tsx";
import { Route, Routes } from "react-router-dom";
import LandingPage from "./static/LandingPage.tsx"; //Export Default Import
import Dashboard from "./components/Dashboard.tsx";

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path={"/"} element={<LandingPage />} />
        <Route path={"/dashboard"} element={<Dashboard />} />
      </Routes>
    </>
  );
}

export default App;
