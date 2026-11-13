import { BrowserRouter, Route, Routes } from "react-router";

import Dashboard from "./components/Dashboard/Dashboard";
import RegisterForm from "./components/RegisterForm/RegisterForm";

import "./App.css";
import LoginForm from "./components/LoginForm/LoginForm";
import UsersPage from "./components/UsersPage/UsersPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/folder/:folderId" element={<Dashboard />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/admin/users" element={<UsersPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
