// src/Admin/AdminLayout.jsx
import React from "react";
import { NavLink, Outlet } from "react-router-dom";

export default function AdminLayout() {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <nav className="w-64 bg-gray-900 text-gray-100 flex flex-col">
        <h2 className="text-3xl font-bold p-6 border-b border-gray-700">
          Admin Dashboard
        </h2>
        <ul className="flex flex-col p-4 space-y-2 flex-1">
          {[
            { to: "/admin", label: "Professors" },
            { to: "/admin/students", label: "Students" },
            { to: "/admin/courses", label: "Courses" },
            // { to: "/admin/professors", label: "Professors" },
            { to: "/admin/create-professor", label: "Create Professor" },
            { to: "/admin/create-student", label: "Create Student" },
            { to: "/admin/create-course", label: "Create Course" },
            { to: "/admin/assign-course", label: "Assign Course" },
            // { to: "/admin/professor-course", label: "Professor Course" },

          ].map(({ to, label }) => (
            <li key={to}>
              <NavLink
                to={to}
                end
                className={({ isActive }) =>
                  `block px-4 py-2 rounded font-medium transition-colors ${
                    isActive
                      ? "bg-gray-700 text-white"
                      : "text-gray-400 hover:bg-gray-700 hover:text-white"
                  }`
                }
              >
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
        <div className="p-4 border-t border-gray-700 text-sm text-gray-500">
          &copy; 2025 Your Company
        </div>
      </nav>

      {/* Main content area */}
      <main className="flex-1 p-8 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
