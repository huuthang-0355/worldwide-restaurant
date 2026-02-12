import { LayoutDashboard, TrendingUp, Clock, Users } from "lucide-react";
import Card from "../../components/ui/Card";
import PageHeader from "../../components/admin/PageHeader";

/**
 * Dashboard - Admin dashboard page with refactored UI components
 */
function Dashboard() {
    return (
        <div>
            <PageHeader
                icon={<LayoutDashboard className="w-7 h-7" />}
                title="Dashboard"
                subtitle="Overview of restaurant operations"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-blue-100 rounded-lg">
                            <TrendingUp className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800">$0</h3>
                    <p className="text-sm text-gray-600 mt-1">Total Revenue</p>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-green-100 rounded-lg">
                            <Clock className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800">0</h3>
                    <p className="text-sm text-gray-600 mt-1">Active Orders</p>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-purple-100 rounded-lg">
                            <Users className="w-6 h-6 text-purple-600" />
                        </div>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800">0</h3>
                    <p className="text-sm text-gray-600 mt-1">Customers Today</p>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-orange-100 rounded-lg">
                            <LayoutDashboard className="w-6 h-6 text-orange-600" />
                        </div>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800">0</h3>
                    <p className="text-sm text-gray-600 mt-1">Tables Occupied</p>
                </Card>
            </div>

            <Card className="p-6">
                <p className="text-gray-600">
                    More dashboard features coming soon...
                </p>
            </Card>
        </div>
    );
}

export default Dashboard;
