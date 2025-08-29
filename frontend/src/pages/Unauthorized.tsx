import React from "react";
import { useNavigate } from "react-router-dom";
import { buttonVariants } from "@/components/ui";
import { AlertTriangle, ArrowLeft, Home } from "lucide-react";

export const Unauthorized: React.FC = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleGoHome = () => {
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="relative w-full max-w-lg mx-auto px-4 py-8">
        <div className="text-center space-y-6">
          <div className="mx-auto mb-6 w-24 h-24 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
            <AlertTriangle className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-[8rem] font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-600 leading-none select-none">
            403
          </h1>
          <div className="space-y-4">
            <h2 className="text-2xl md:text-4xl font-bold text-gray-900">
              Access Denied
            </h2>
            <p className="text-lg text-gray-600 max-w-md mx-auto">
              You don't have permission to access this page. Contact your
              administrator if you believe this is an error.
            </p>
            <div className="pt-4 space-y-3">
              <button
                onClick={handleGoHome}
                className={buttonVariants({
                  variant: "default",
                  size: "lg",
                  className:
                    "w-full px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300",
                })}
              >
                <Home className="w-5 h-5 mr-2" />
                Go to Dashboard
              </button>
              <button
                onClick={handleGoBack}
                className={buttonVariants({
                  variant: "outline",
                  size: "lg",
                  className:
                    "w-full px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300",
                })}
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Go Back
              </button>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -top-16 -left-16 w-32 h-32 bg-red-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-16 -right-16 w-32 h-32 bg-orange-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
      </div>
    </div>
  );
};
