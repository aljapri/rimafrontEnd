import React, { useEffect, useState } from "react";

export default function StudentsList() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Update modal state for editing
  const [editingStudent, setEditingStudent] = useState(null);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    userName: "",
    emailConfirmed: false,
  });
  const [updating, setUpdating] = useState(false);

  // Fetch students
  async function fetchStudents() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("http://localhost:5000/api/Admin/students");
      if (!res.ok) throw new Error("Failed to fetch students");
      const data = await res.json();
      setStudents(data);
    } catch (err) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchStudents();
  }, []);

  // Delete student
  async function handleDelete(userId) {
    if (!window.confirm("Are you sure you want to delete this student?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/Admin/delete-student/${userId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`المستخدم مسجل في كورس `);
      }

      setStudents((prev) => prev.filter((stu) => stu.userId !== userId));
    } catch (err) {
      alert(err.message);
    }
  }

  // Open update modal with student data
  function handleEdit(student) {
    setEditingStudent(student);
    setFormData({
      fullName: student.fullName,
      email: student.email,
      userName: student.userName,
      emailConfirmed: student.emailConfirmed,
    });
  }

  // Handle form input change
  function onChange(e) {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  // Submit update form
  async function handleUpdateSubmit(e) {
    e.preventDefault();
    setUpdating(true);

    try {
      const res = await fetch("http://localhost:5000/api/Admin/update-student", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: editingStudent.userId,
          ...formData,
        }),
      });

      if (!res.ok) throw new Error("Failed to update student");

      setStudents((prev) =>
        prev.map((stu) =>
          stu.userId === editingStudent.userId ? { userId: stu.userId, ...formData } : stu
        )
      );
      setEditingStudent(null);
    } catch (err) {
      alert(err.message);
    } finally {
      setUpdating(false);
    }
  }

  return (
    <div className="bg-white shadow rounded-lg p-6 max-w-full overflow-x-auto">
      <h1 className="text-2xl font-bold mb-6 text-gray-900">Students List</h1>

      {loading && <p className="text-gray-500">Loading students...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}

      {!loading && !error && (
        <table className="min-w-full table-auto border-collapse border border-gray-200">
          <thead>
            <tr className="bg-gray-100 text-gray-700">
              <th className="border border-gray-300 px-4 py-2 text-left">Full Name</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Email</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Username</th>
              <th className="border border-gray-300 px-4 py-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-6 text-gray-500 italic">
                  No students found.
                </td>
              </tr>
            ) : (
              students.map(({ userId, fullName, email, userName, emailConfirmed }) => (
                <tr key={userId} className="hover:bg-gray-50 transition-colors">
                  <td className="border border-gray-300 px-4 py-2">{fullName}</td>
                  <td className="border border-gray-300 px-4 py-2">{email}</td>
                  <td className="border border-gray-300 px-4 py-2">{userName}</td>
     
                  <td className="border border-gray-300 px-4 py-2 text-center space-x-2">
                    <button
                      onClick={() =>
                        handleEdit({ userId, fullName, email, userName, emailConfirmed })
                      }
                      className="px-3 py-1 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      aria-label={`Update ${fullName}`}
                    >
                      Update
                    </button>
                    <button
                      onClick={() => handleDelete(userId)}
                      className="px-3 py-1 text-sm font-medium text-white bg-red-600 rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                      aria-label={`Delete ${fullName}`}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}

      {/* Update Modal */}
      {editingStudent && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setEditingStudent(null)}
        >
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleUpdateSubmit}
            className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
          >
            <h2 className="text-xl font-semibold mb-4">Update Student</h2>

            <label className="block mb-2">
              Full Name
              <input
                name="fullName"
                value={formData.fullName}
                onChange={onChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded px-3 py-2"
                type="text"
              />
            </label>

            <label className="block mb-2">
              Email
              <input
                name="email"
                value={formData.email}
                onChange={onChange}
                required
                type="email"
                className="mt-1 block w-full border border-gray-300 rounded px-3 py-2"
              />
            </label>

            <label className="block mb-2">
              Username
              <input
                name="userName"
                value={formData.userName}
                onChange={onChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded px-3 py-2"
                type="text"
              />
            </label>

            <label className="flex items-center mb-4 space-x-2">
              <input
                type="checkbox"
                name="emailConfirmed"
                checked={formData.emailConfirmed}
                onChange={onChange}
                className="rounded"
              />
              <span>Email Confirmed</span>
            </label>

            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setEditingStudent(null)}
                className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updating}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {updating ? "Updating..." : "Update"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
