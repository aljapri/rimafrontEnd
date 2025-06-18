import React, { useEffect, useState } from "react";

export default function AssignCourse() {
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [professors, setProfessors] = useState([]);
  const [message, setMessage] = useState("");

  const fetchCourses = async () => {
    const res = await fetch("http://localhost:5000/api/Admin/courses");
    const data = await res.json();
    setCourses(data);
  };

  const fetchProfessors = async () => {
    const res = await fetch("http://localhost:5000/api/Admin/professors");
    const data = await res.json();
    setProfessors(data);
  };

  const handleAssign = async (professorId) => {
    const res = await fetch("http://localhost:5000/api/Admin/assign-professor-to-course", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        professorId: professorId,
        courseId: selectedCourseId,
      }),
    });

    if (res.ok) {
      setMessage("Course assigned successfully.");
    } else {
      const err = await res.text();
      setMessage("Error: " + err);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourseId) {
      fetchProfessors();
    }
  }, [selectedCourseId]);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow rounded">
      <h2 className="text-2xl font-bold mb-6">Assign Professors to Course</h2>

      <div className="mb-6">
        <label className="block mb-2 font-medium">Select Course</label>
        <select
          className="w-full border px-3 py-2 rounded"
          value={selectedCourseId || ""}
          onChange={(e) => setSelectedCourseId(e.target.value)}
        >
          <option value="">-- Select Course --</option>
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.name} ({course.theoreticalHours}T / {course.practicalHours}P)
            </option>
          ))}
        </select>
      </div>

      {selectedCourseId && (
        <div>
          <h3 className="text-xl font-semibold mb-4">Available Professors</h3>
          <ul className="space-y-3">
            {professors.map((prof) => (
              <li
                key={prof.userId}
                className="flex justify-between items-center p-4 border rounded shadow-sm"
              >
                <div>
                  <p className="font-medium">{prof.fullName}</p>
                  <p className="text-sm text-gray-600">{prof.specialization}</p>
                </div>
                <button
                  onClick={() => handleAssign(prof.userId)}
                  className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
                >
                  Assign
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {message && <p className="mt-4 text-green-700 font-semibold">{message}</p>}
    </div>
  );
}
