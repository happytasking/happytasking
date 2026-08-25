import { Link } from "react-router-dom";
import { Button } from "../components/common/Button";

const NotFound = () => {
  return (
    <div className="flex min-h-[80vh] items-center justify-center px-6">
      <div className="text-center">
        <h1 className="bg-gradient-to-r from-fuchsia-500 to-indigo-700 bg-clip-text text-8xl font-bold text-transparent">
          404
        </h1>

        <h2 className="mt-4 text-3xl font-semibold text-text-primary">
          Page Not Found
        </h2>

        <p className="mt-3 text-text-secondary">
          Sorry, the page you are looking for doesn't exist.
        </p>

        <Link to="/" className="mt-8 inline-block">
          <Button>Go Back Home</Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
