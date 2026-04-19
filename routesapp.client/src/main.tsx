import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from "react-router-dom"  
import WelcomePage from "./Components/Welcome"
import LoginPage from "./Components/Login"  
import SignUpPage from "./Components/SignUp"
createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <BrowserRouter>    
            <Routes >
                <Route path = "/" element={<WelcomePage />} />
                <Route path = "/login" element={<LoginPage />} />
                <Route path = "/signup" element={<SignUpPage />} />
            </Routes>
        </BrowserRouter>      
    </StrictMode>
)