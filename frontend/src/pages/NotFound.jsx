import { AlertCircle, Home } from "lucide-react";
import { Link } from "react-router-dom";
import Button from "../components/ui/Button";

/**
 * NotFound - 404 page with refactored UI components
 */
function NotFound() {
    return (
        <div className="flex items-center justify-center h-screen bg-gray-50">
            <div className="text-center">
                <div className="flex justify-center mb-6">
                    <div className="p-4 bg-red-100 rounded-full">
                        <AlertCircle className="w-16 h-16 text-red-600" />
                    </div>
                </div>
                <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
                <p className="text-xl text-gray-600 mb-8">
                    Oops! The page you&apos;re looking for doesn&apos;t exist.
                </p>
                <Link to="/admin/menu">
                    <Button variant="primary" size="lg">
                        <Home className="w-5 h-5 mr-2" />
                        Go to Menu Management
                    </Button>
                </Link>
            </div>
        </div>
    );
}

export default NotFound;
