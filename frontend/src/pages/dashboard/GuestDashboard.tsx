import { PageHeader } from "@/components/dashboard/PageHeader";

export const GuestDashboard = () => {
  return (
    <>
      <PageHeader title="Dashboard" description="Welcome to your dashboard" />
      <div className="p-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border bg-white p-4">
            <div className="text-sm font-medium text-gray-600">
              Total Revenue
            </div>
            <div className="mt-2 text-2xl font-bold">$45,231.89</div>
          </div>
          <div className="rounded-lg border bg-white p-4">
            <div className="text-sm font-medium text-gray-600">Orders</div>
            <div className="mt-2 text-2xl font-bold">+2350</div>
          </div>
          <div className="rounded-lg border bg-white p-4">
            <div className="text-sm font-medium text-gray-600">Products</div>
            <div className="mt-2 text-2xl font-bold">+12,234</div>
          </div>
          <div className="rounded-lg border bg-white p-4">
            <div className="text-sm font-medium text-gray-600">
              Active Users
            </div>
            <div className="mt-2 text-2xl font-bold">+573</div>
          </div>
        </div>
        <div className="mt-6 rounded-lg border bg-white p-6">
          <h2 className="text-lg font-medium">Recent Activity</h2>
          <div className="mt-4">
            <p className="text-sm text-gray-600">
              Dashboard content goes here.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};
