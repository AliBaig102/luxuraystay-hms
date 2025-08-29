import { buttonVariants } from "@/components/ui";
import { Link } from "react-router-dom";

export const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted">
      <div className="relative w-full max-w-lg mx-auto px-4 py-8">
        <div className="text-center space-y-6">
          <h1 className="text-[12rem] font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-chart-2 to-chart-3 leading-none select-none">
            404
          </h1>
          <div className="space-y-4">
            <h2 className="text-2xl md:text-4xl font-bold text-foreground">
              Oops! Page Not Found
            </h2>
            <p className="text-lg text-muted-foreground max-w-md mx-auto">
              The page you're looking for doesn't exist or has been moved to a
              different location.
            </p>
            <div className="pt-4">
              <Link
                to="/"
                className={buttonVariants({
                  variant: "default",
                  size: "lg",
                  className:
                    "px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300",
                })}
              >
                Return Home
              </Link>
            </div>
          </div>
        </div>

        {/* Optional decorative elements */}
        <div className="absolute -top-16 -left-16 w-32 h-32 bg-chart-2/10 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-16 -right-16 w-32 h-32 bg-chart-3/10 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
      </div>
    </div>
  );
};
