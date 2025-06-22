import React, { useEffect, useState } from "react";

export default function ProfessorsList() {
  const [professors, setProfessors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // For editing professor modal
  const [editingProfessor, setEditingProfessor] = useState(null);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    userName: "",
    emailConfirmed: false,
    specialization: "",
  });
  const [updating, setUpdating] = useState(false);

  // Selected professor's courses
  const [selectedProfessorId, setSelectedProfessorId] = useState(null);
  const [professorCourses, setProfessorCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [coursesError, setCoursesError] = useState(null);

  // Fetch professors
  async function fetchProfessors() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("http://localhost:5000/api/Admin/professors");
      if (!res.ok) throw new Error("Failed to fetch professors");
      const data = await res.json();
      setProfessors(data);
    } catch (err) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProfessors();
  }, []);

  // Fetch courses for selected professor
  async function fetchCourses(professorId) {
    if (selectedProfessorId === professorId) {
      // Toggle off if already selected
      setSelectedProfessorId(null);
      setProfessorCourses([]);
      return;
    }

    setCoursesLoading(true);
    setCoursesError(null);
    try {
      const res = await fetch(
        `http://localhost:5000/api/Admin/professor/${professorId}/professor-courses`
      );
      if (!res.ok) throw new Error("Failed to fetch professor courses");
      const data = await res.json();
      setProfessorCourses(data);
      setSelectedProfessorId(professorId);
    } catch (err) {
      setCoursesError(err.message || "Unknown error");
      setProfessorCourses([]);
      setSelectedProfessorId(null);
    } finally {
      setCoursesLoading(false);
    }
  }

  // Delete professor
  async function handleDelete(userId) {
    if (!window.confirm("Are you sure you want to delete this professor?")) return;

    try {
      const res = await fetch(
        `http://localhost:5000/api/Admin/delete-professor/${userId}`,
        {
          method: "DELETE",
        }
      );

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`الدكتور مسجل في كورس `);
      }

      setProfessors((prev) => prev.filter((prof) => prof.userId !== userId));

      if (userId === selectedProfessorId) {
        setSelectedProfessorId(null);
        setProfessorCourses([]);
      }
    } catch (err) {
      alert(err.message);
    }
  }

  // Open update modal with professor data
  function handleEdit(professor) {
    setEditingProfessor(professor);
    setFormData({
      fullName: professor.fullName,
      email: professor.email,
      userName: professor.userName,
      emailConfirmed: professor.emailConfirmed,
      specialization: professor.specialization,
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
      const res = await fetch("http://localhost:5000/api/Admin/update-professor", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: editingProfessor.userId,
          ...formData,
        }),
      });

      if (!res.ok) throw new Error("Failed to update professor");

      setProfessors((prev) =>
        prev.map((prof) =>
          prof.userId === editingProfessor.userId ? { userId: prof.userId, ...formData } : prof
        )
      );
      setEditingProfessor(null);
    } catch (err) {
      alert(err.message);
    } finally {
      setUpdating(false);
    }
  }

  return (
    <div className="bg-white shadow rounded-lg p-6 max-w-full overflow-x-auto">
      <h1 className="text-2xl font-bold mb-6 text-gray-900">Professors List</h1>

      {loading && <p className="text-gray-500">Loading professors...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}

      {!loading && !error && (
        <table className="min-w-full table-auto border-collapse border border-gray-200">
          <thead>
            <tr className="bg-gray-100 text-gray-700">
              <th className="border border-gray-300 px-4 py-2 text-left">Full Name</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Email</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Username</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Specialization</th>
              <th className="border border-gray-300 px-4 py-2 text-center">Actions</th>
              <th className="border border-gray-300 px-4 py-2 text-center">Show Courses</th>
            </tr>
          </thead>
          <tbody>
            {professors.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-6 text-gray-500 italic">
                  No professors found.
                </td>
              </tr>
            ) : (
              professors.map(
                ({
                  userId,
                  fullName,
                  email,
                  userName,
                  emailConfirmed,
                  specialization,
                }) => (
                  <tr key={userId} className="hover:bg-gray-50 transition-colors">
                    <td className="border border-gray-300 px-4 py-2">{fullName}</td>
                    <td className="border border-gray-300 px-4 py-2">{email}</td>
                    <td className="border border-gray-300 px-4 py-2">{userName}</td>
                    <td className="border border-gray-300 px-4 py-2">{specialization}</td>
                    <td className="border border-gray-300 px-4 py-2 text-center space-x-2">
                      <button
                        onClick={() =>
                          handleEdit({
                            userId,
                            fullName,
                            email,
                            userName,
                            emailConfirmed,
                            specialization,
                          })
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
                    <td className="border border-gray-300 px-4 py-2 text-center">
                      <button
                        onClick={() => fetchCourses(userId)}
                        className="px-3 py-1 text-sm font-medium text-white bg-green-600 rounded hover:bg-green-700 focus:outline-none"
                      >
                        {selectedProfessorId === userId ? "Hide Courses" : "Show Courses"}
                      </button>
                    </td>
                  </tr>
                )
              )
            )}
          </tbody>
        </table>
      )}

      {/* Show professor courses */}
      {selectedProfessorId && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-4">
            Courses of Professor:{" "}
            {professors.find((p) => p.userId === selectedProfessorId)?.fullName}
          </h2>

          {coursesLoading && <p>Loading courses...</p>}
          {coursesError && <p className="text-red-500">Error: {coursesError}</p>}

          {!coursesLoading && !coursesError && (
            <ul className="list-disc pl-6">
              {professorCourses.length === 0 ? (
                <li>لا توجد مقررات معتمدة.</li>
              ) : (
                professorCourses.map((course) => {
                  // Show فئة for theoretical and زمرة for practical hours if > 0
                  const parts = [];
                  if (course.theoreticalN > 0) parts.push(`فئة: ${course.theoreticalN}`);
                  if (course.practicalN > 0) parts.push(`زمرة: ${course.practicalN}`);

                  const hoursDisplay = parts.join(" / ");

                  return (
                    <li key={course.professorCourseId || course.professorCourseId}>
                      {course.courseName}
                      {hoursDisplay ? ` - ${hoursDisplay}` : ""}
                    </li>
                  );
                })
              )}
            </ul>
          )}
        </div>
      )}

      {/* Update Modal */}
      {editingProfessor && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setEditingProfessor(null)}
        >
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleUpdateSubmit}
            className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
          >
            <h2 className="text-xl font-semibold mb-4">Update Professor</h2>

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

            <label className="flex items-center mb-2 space-x-2">
              <input
                type="checkbox"
                name="emailConfirmed"
                checked={formData.emailConfirmed}
                onChange={onChange}
                className="rounded"
              />
              <span>Email Confirmed</span>
            </label>

            <label className="block mb-4">
              Specialization
              <input
                name="specialization"
                value={formData.specialization}
                onChange={onChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded px-3 py-2"
                type="text"
              />
            </label>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setEditingProfessor(null)}
                className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 focus:outline-none"
                disabled={updating}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updating}
                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 focus:outline-none"
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
