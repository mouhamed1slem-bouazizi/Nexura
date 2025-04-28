'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { 
  HomeIcon, UserIcon, CogIcon, ChatBubbleLeftIcon, 
  UsersIcon, ChevronLeftIcon, ChevronRightIcon 
} from '@heroicons/react/24/outline';

export function Sidebar({ children }: { children: React.ReactNode }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const pathname = usePathname();
  const { user } = useAuth();

  const authenticatedMenuItems = [
    { name: 'Dashboard', icon: HomeIcon, path: '/dashboard' },
    { name: 'Profile', icon: UserIcon, path: '/dashboard/profile' },
    { name: 'Messages', icon: ChatBubbleLeftIcon, path: '/dashboard/messages' },
    { name: 'Friends', icon: UsersIcon, path: '/dashboard/friends' },
    { name: 'Social Media', icon: HomeIcon, path: '/dashboard/social-media' },
    { name: 'Settings', icon: CogIcon, path: '/dashboard/settings' },
  ];

  const unauthenticatedMenuItems = [
    { name: 'Login', icon: UserIcon, path: '/login' },
    { name: 'Sign Up', icon: UsersIcon, path: '/signup' },
  ];

  const menuItems = user ? authenticatedMenuItems : unauthenticatedMenuItems;

  return (
    <>
      <div className={`${isExpanded ? 'w-64' : 'w-20'} transition-all duration-300 bg-white border-r h-screen fixed left-0 top-0 z-30`}>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="absolute -right-3 top-10 bg-white border rounded-full p-1 shadow-md"
        >
          {isExpanded ? (
            <ChevronLeftIcon className="w-4 h-4 text-gray-700" />
          ) : (
            <ChevronRightIcon className="w-4 h-4 text-gray-700" />
          )}
        </button>

        <div className="p-4">
          <div className="mb-8">
            <Link href="/">
              {isExpanded ? (
                <h1 className="text-xl font-bold text-gray-900">Social Media</h1>
              ) : (
                <h1 className="text-xl font-bold text-center text-gray-900">SM</h1>
              )}
            </Link>
          </div>

          <nav className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.path;

              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`flex items-center space-x-2 p-3 rounded-lg transition-colors
                    ${isActive 
                      ? 'bg-blue-100 text-blue-700 font-medium' 
                      : 'text-gray-800 hover:bg-gray-100'
                    }`}
                >
                  <Icon className={`w-6 h-6 ${isActive ? 'text-blue-700' : 'text-gray-700'}`} />
                  {isExpanded && <span className="font-medium">{item.name}</span>}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
      <div className={`${isExpanded ? 'pl-64' : 'pl-20'} transition-all duration-300 w-full`}>
        {children}
      </div>
    </>
  );
}