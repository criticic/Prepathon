import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";

export default function AuthPage() {
  const navigate = useNavigate()
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-r from-purple-500 via-pink-500 to-red-500">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-6 text-neutral-800">
          Gain valueable insights now
        </h1>
        <div className="space-y-4">
        <Input
            type="email"
            placeholder="name@yourcompany.com"
            className="w-full"
          />
          <Input
            type="password"
            placeholder="Your password"
            className="w-full"
          />
          <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white">
            Continue with email
          </Button>
          <div className="text-center mt-4">
            <button className="text-sm text-orange-500 hover:underline"
            onClick={()=>navigate('/forgotpassword')}
            >
              Forgot password?
            </button>
          </div>
          

          <div className="text-center text-sm text-gray-500">OR</div>
          
          <Button className="w-full bg-white text-gray-900 hover:bg-gray-200">
            <img
              src="https://img.icons8.com/color/24/google-logo.png"
              alt="GitHub Logo"
              className="inline mr-2"
            />
            Continue with Google
          </Button>

          {/* New GitHub Button */}
          <Button className="w-full bg-white text-gray-900 hover:bg-gray-200">
            <img
              src="https://img.icons8.com/ios-glyphs/24/github.png"
              alt="GitHub Logo"
              className="inline mr-2"
            />
            Continue with GitHub
          </Button>
        </div>
      </div>
    </div>
  );
}
