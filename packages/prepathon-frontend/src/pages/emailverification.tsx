import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";

export default function EmailVerificationPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-6 text-neutral-800">Email Verification</h1>
        <div className="space-y-4">
          <p className="text-center text-gray-600">
            Enter the OTP that has been sent to your email address.
          </p>
          <Input
            type="text"
            placeholder="Enter your OTP"
            className="w-full"
          />
          <Button className="w-full bg-indigo-500 hover:bg-indigo-600 text-white">
            Verify OTP
          </Button>
          <div className="text-center mt-4">
            <a href="/emailverify" className="text-sm text-indigo-500 hover:underline">
              Didn't receive an OTP? Resend
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
