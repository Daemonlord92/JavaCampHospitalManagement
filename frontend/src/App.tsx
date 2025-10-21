import "./App.css";
import Navbar from "./static/Navbar.tsx";
import { Route, Routes } from "react-router-dom";
import LandingPage from "./static/LandingPage.tsx"; //Export Default Import
import Dashboard from "./components/Dashboard.tsx";
import Login from "./components/auth/Login.tsx";
import ProtectedRoute from "./components/shared/ProtectedRoute.tsx";

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path={"/"} element={<LandingPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path={"/dashboard"} element={<Dashboard />} />
        </Route>
        <Route path={"/login"} element={<Login />} />
      </Routes>
    </>
  );
}

export default App;
