import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

import LandingPage from './pages/landing.tsx';
import AuthPage from './pages/auth.tsx';
import EmailVerficationPage from './pages/emailverification.tsx';
import ForgotPasswordPage from './pages/forgotpass.tsx';

const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage/>,
  },
  {
    path: "/auth",
    element: <AuthPage/>,
  },
  {
    path: "/forgotpassword",
    element: <ForgotPasswordPage/>,
  },
  {
    path: "/emailverify",
    element: <EmailVerficationPage/>,
  },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
      <RouterProvider router={router} />
  </StrictMode>,
)
