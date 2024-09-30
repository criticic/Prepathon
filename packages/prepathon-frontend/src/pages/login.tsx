import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useState } from "react";

export default function LoginPage() {
  const [darkMode, setDarkMode] = useState(true);
  const navigate = useNavigate()
  return (
    <div className={`flex min-h-screen items-center justify-center ${darkMode ? 'bg-neutral-900' : 'bg-neutral-200'}`}>
      <div className="absolute top-4 right-4">
        <Button
          onClick={() => setDarkMode(!darkMode)}
          className="bg-neutral-700 text-white px-4 py-2 rounded-lg"
        >
          {darkMode ? 'Enable Light Mode' : 'Enable Dark Mode'}
        </Button>
      </div>

      <div
        className={`p-8 rounded-lg w-full max-w-md ${darkMode ? 'bg-neutral-800' : 'bg-white'} 
        ${!darkMode ? 'shadow-lg' : ''} transition-shadow duration-300 ease-in-out`}
      >
        <h1 className={`text-3xl font-bold text-center mb-6 ${darkMode ? 'text-white' : 'text-neutral-800'}`}>
          Login
        </h1>

        <p className={`text-center mb-4 ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
          Don’t have an account? <span className="text-orange-500 hover:underline cursor-pointer"
          onClick={() => navigate('/auth')}
          >Sign up</span>
        </p>

        <div className="space-y-4">
          <Input
            type="email"
            placeholder="Email"
            className={`w-full ${darkMode ? 'bg-neutral-700 text-white' : 'bg-neutral-100 text-black'} rounded-lg`}
          />
          <Input
            type="password"
            placeholder="Password"
            className={`w-full ${darkMode ? 'bg-neutral-700 text-white' : 'bg-neutral-100 text-black'} rounded-lg`}
          />

          <div className="text-right">
            <button className="text-sm text-orange-500 hover:underline">
              Forgot Password?
            </button>
          </div>

          <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-lg"
          onClick={() => navigate('/chat')}
          >
            Sign in
          </Button>

          <div className="text-center text-sm mt-4">
            <p className={`${darkMode ? 'text-neutral-500' : 'text-neutral-400'}`}>OR</p>
          </div>

          <div className="flex space-x-4">
            <Button className="w-full bg-white text-gray-900 hover:bg-gray-200 rounded-lg">
              <img
                src="https://img.icons8.com/color/24/google-logo.png"
                alt="Google Logo"
                className="inline mr-2"
              />
              Sign in with Google
            </Button>

            <Button className="w-full bg-white text-gray-900 hover:bg-gray-200 rounded-lg">
              <img
                src="https://img.icons8.com/ios-glyphs/24/github.png"
                alt="GitHub Logo"
                className="inline mr-2"
              />
              Sign in with GitHub
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
