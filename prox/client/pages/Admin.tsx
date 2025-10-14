import React, { useState, useEffect } from 'react';
import { SidebarProvider, SidebarInset, useSidebar } from '../Sidebar';
import { AdminNavbar } from '../AdminNavbar';

function AdminContent() {
  const { activeProject } = useSidebar();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Admin Header */}
      <div className="hidden md:block bg-slate-800 border-b border-slate-700 p-6">
        <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
        <p className="text-gray-400 mt-2">ProX Academy boshqaruv paneli</p>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {activeProject === 'Blogs' && (
          <div className="bg-slate-800 rounded-lg p-8">
            <h2 className="text-xl font-bold text-white mb-4">Profil</h2>
            <p className="text-gray-300">Foydalanuvchi profili boshqaruvi</p>
            <div className="mt-4 p-4 bg-slate-700 rounded-lg">
              <p className="text-green-400">✅ Profil sahifasi yuklandi</p>
            </div>
          </div>
        )}

        {activeProject === 'Resume Builder' && (
          <div className="bg-slate-800 rounded-lg p-8">
            <h2 className="text-xl font-bold text-white mb-4">Xavfsizlik</h2>
            <p className="text-gray-300">Xavfsizlik sozlamalari</p>
            <div className="mt-4 p-4 bg-slate-700 rounded-lg">
              <p className="text-blue-400">✅ Xavfsizlik sahifasi yuklandi</p>
            </div>
          </div>
        )}

        {activeProject === 'Payments' && (
          <div className="bg-slate-800 rounded-lg p-8">
            <h2 className="text-xl font-bold text-white mb-4">To'lovlar</h2>
            <p className="text-gray-300">To'lov tizimi boshqaruvi</p>
            <div className="mt-4 p-4 bg-slate-700 rounded-lg">
              <p className="text-purple-400">✅ To'lovlar sahifasi yuklandi</p>
            </div>
          </div>
        )}

        {!activeProject && (
          <div className="bg-slate-800 rounded-lg p-8">
            <h2 className="text-xl font-bold text-white mb-4">Admin Dashboard</h2>
            <p className="text-gray-300">ProX Academy admin paneliga xush kelibsiz!</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="bg-slate-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-2">Foydalanuvchilar</h3>
                <p className="text-gray-300">Foydalanuvchi boshqaruvi</p>
                <p className="text-green-400 text-sm mt-2">Status: Aktiv</p>
              </div>
              <div className="bg-slate-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-2">Kurslar</h3>
                <p className="text-gray-300">Kurs boshqaruvi</p>
                <p className="text-blue-400 text-sm mt-2">Status: Aktiv</p>
              </div>
              <div className="bg-slate-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-2">Statistika</h3>
                <p className="text-gray-300">Platforma statistikasi</p>
                <p className="text-purple-400 text-sm mt-2">Status: Aktiv</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Admin() {
  return (
    <SidebarProvider>
      <div className="flex h-screen bg-background">
        <AdminNavbar />
        <SidebarInset className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8 md:pt-4 pt-20 pb-16">
            <AdminContent />
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

export default Admin;
