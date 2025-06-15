import { ProfileInfo } from '@/components/profile-info';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Money Manager App
          </h1>
          <p className="text-lg text-gray-600">
            Test your authentication and manage your finances
          </p>
        </div>
        <ProfileInfo />
      </div>
    </div>
  );
}
