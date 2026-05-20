import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from "react-router-dom"  
import WelcomePage from "./Components/Welcome/Welcome.tsx"
import LoginPage from "./Components/Login/Login.tsx"
import SignUpPage from "./Components/SignUp/SignUp.tsx"
import DashboardPage from "./Components/Dashboard/DashboardPage.tsx"
import PlanningPage from "./Components/Planning/PlanningPage.tsx"
createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <BrowserRouter>    
            <Routes >
                <Route path = "/" element={<WelcomePage />} />
                <Route path = "/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignUpPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/planning" element={<PlanningPage />} />
            </Routes>
        </BrowserRouter>      
    </StrictMode>
)