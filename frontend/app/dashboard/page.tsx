export default function DashboardPage() {
  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
        <p className="text-gray-600">
          Monitor your team's communication progress and insights.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Team Analytics</h2>
          <p className="text-gray-600">
            View detailed analytics about your team's communication patterns.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Progress Reports</h2>
          <p className="text-gray-600">
            Track improvement over time and identify areas for growth.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Team Management</h2>
          <p className="text-gray-600">
            Manage team members and their communication preferences.
          </p>
        </div>
      </div>

      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-blue-800 mb-2">Coming Soon</h2>
        <p className="text-blue-700">
          Dashboard features are currently under development. You'll soon be able to view comprehensive analytics and manage your team's communication journey.
        </p>
      </div>
    </div>
  );
}