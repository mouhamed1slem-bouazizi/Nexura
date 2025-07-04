'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/core/Card';
import { Button } from '@/components/ui/core/Button';
import Link from 'next/link';
import Image from 'next/image';

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 bg-white">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
        <Link href="/dashboard/profile/editor">
          <Button variant="outline">Edit Profile</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 md:col-span-1 bg-white border border-gray-200">
          <div className="flex flex-col items-center">
            <div className="relative w-32 h-32 mb-4">
              <Image
                src={user?.photoURL || '/default-avatar.png'}
                alt="Profile"
                fill
                className="rounded-full object-cover"
              />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">{user?.displayName || 'User'}</h2>
            <p className="text-gray-700">{user?.email}</p>
          </div>
        </Card>

        <div className="md:col-span-2 space-y-6">
          <Card className="p-6 bg-white border border-gray-200">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">Activity Overview</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="border rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-gray-900">12</p>
                <p className="text-gray-700">Posts</p>
              </div>
              <div className="border rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-gray-900">458</p>
                <p className="text-gray-700">Followers</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white border border-gray-200">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">Recent Activity</h2>
            <div className="space-y-4">
              {[1, 2, 3].map((activity) => (
                <div key={activity} className="border-b pb-4">
                  <p className="font-medium text-gray-800">Posted a new update</p>
                  <p className="text-gray-700 text-sm">2 days ago</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}