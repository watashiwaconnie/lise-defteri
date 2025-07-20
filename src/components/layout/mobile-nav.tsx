'use client';

import { Fragment } from 'react';
import Link from 'next/link';
import { Dialog, Transition } from '@headlessui/react';
import { X, LogOut, Settings, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  navigation: Array<{
    name: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
  }>;
  user: any;
  profile: any;
  onSignOut: () => void;
}

export function MobileNav({
  isOpen,
  onClose,
  navigation,
  user,
  profile,
  onSignOut,
}: MobileNavProps) {
  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50 lg:hidden" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="transition-opacity ease-linear duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity ease-linear duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-900/80" />
        </Transition.Child>

        <div className="fixed inset-0 flex">
          <Transition.Child
            as={Fragment}
            enter="transition ease-in-out duration-300 transform"
            enterFrom="-translate-x-full"
            enterTo="translate-x-0"
            leave="transition ease-in-out duration-300 transform"
            leaveFrom="translate-x-0"
            leaveTo="-translate-x-full"
          >
            <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
              <Transition.Child
                as={Fragment}
                enter="ease-in-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in-out duration-300"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                  <button
                    type="button"
                    className="-m-2.5 p-2.5"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close sidebar</span>
                    <X className="h-6 w-6 text-white" aria-hidden="true" />
                  </button>
                </div>
              </Transition.Child>

              <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4">
                {/* Logo */}
                <div className="flex h-16 shrink-0 items-center">
                  <div className="flex items-center space-x-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary">
                      <span className="text-sm font-bold text-white">LF</span>
                    </div>
                    <span className="font-bold text-gray-900">Lise Forumu</span>
                  </div>
                </div>

                {/* User Profile Section */}
                {user && profile && (
                  <div className="flex items-center space-x-3 rounded-lg bg-gray-50 p-3">
                    <Avatar
                      src={profile.avatar_url}
                      alt={profile.display_name || profile.username}
                      fallback={profile.username?.[0]?.toUpperCase() || 'U'}
                      size="lg"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {profile.display_name || profile.username}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {user.email}
                      </p>
                      {profile.level && (
                        <div className="flex items-center mt-1">
                          <span className="text-xs bg-primary-100 text-primary-800 px-2 py-0.5 rounded-full">
                            Seviye {profile.level}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Navigation */}
                <nav className="flex flex-1 flex-col">
                  <ul role="list" className="flex flex-1 flex-col gap-y-7">
                    <li>
                      <ul role="list" className="-mx-2 space-y-1">
                        {navigation.map((item) => (
                          <li key={item.name}>
                            <Link
                              href={item.href}
                              onClick={onClose}
                              className="group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold text-gray-700 hover:text-primary-600 hover:bg-gray-50"
                            >
                              <item.icon
                                className="h-6 w-6 shrink-0"
                                aria-hidden="true"
                              />
                              {item.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </li>

                    {/* User Actions */}
                    {user && (
                      <li className="mt-auto">
                        <div className="space-y-1">
                          <Link
                            href="/profile"
                            onClick={onClose}
                            className="group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold text-gray-700 hover:text-primary-600 hover:bg-gray-50"
                          >
                            <User className="h-6 w-6 shrink-0" />
                            Profil
                          </Link>
                          <Link
                            href="/settings"
                            onClick={onClose}
                            className="group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold text-gray-700 hover:text-primary-600 hover:bg-gray-50"
                          >
                            <Settings className="h-6 w-6 shrink-0" />
                            Ayarlar
                          </Link>
                          <button
                            onClick={() => {
                              onSignOut();
                              onClose();
                            }}
                            className="group flex w-full gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <LogOut className="h-6 w-6 shrink-0" />
                            Çıkış Yap
                          </button>
                        </div>
                      </li>
                    )}

                    {/* Auth Buttons for Non-authenticated Users */}
                    {!user && (
                      <li className="mt-auto space-y-2">
                        <Button asChild className="w-full">
                          <Link href="/auth/login" onClick={onClose}>
                            Giriş Yap
                          </Link>
                        </Button>
                        <Button variant="outline" asChild className="w-full">
                          <Link href="/auth/register" onClick={onClose}>
                            Kayıt Ol
                          </Link>
                        </Button>
                      </li>
                    )}
                  </ul>
                </nav>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
}