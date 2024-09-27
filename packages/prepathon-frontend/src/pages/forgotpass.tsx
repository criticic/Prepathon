import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";

export default function ForgotPasswordPage() {
  const navigate = useNavigate()
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-r from-orange-400 via-yellow-300 to-red-400">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-6 text-neutral-800">Forgot Password</h1>
        <div className="space-y-4">
          <p className="text-center text-gray-600">
            Enter your email address and we'll send you an OTP to verify your account.
          </p>
          <Input
            type="email"
            placeholder="Enter your email address"
            className="w-full"
          />
          <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white"
          onClick={() => navigate('/emailverify')}
          >
            Send Verification Email
          </Button>
          <div className="text-center mt-4">
            <a href="/forgotpassword" className="text-sm text-orange-500 hover:underline">
              Back to Login
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
