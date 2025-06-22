import React, { useEffect, useState } from "react";

export default function ListCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({
    name: "",
    practicalHours: 0,
    theoreticalHours: 0,
    maxAbsenceLimitPractical: 0,
    maxAbsenceLimitTheoretical: 0,
    fullAttendance: 0,
  });

  const [showPracticalInput, setShowPracticalInput] = useState(true);
  const [showTheoreticalInput, setShowTheoreticalInput] = useState(true);

  const fetchCourses = async () => {
    setLoading(true);
    const res = await fetch("http://localhost:5000/api/Admin/courses");
    const data = await res.json();
    setCourses(data);
    setLoading(false);
  };

  const handleEditClick = (course) => {
    setEditId(course.id);
    setForm({
      name: course.name,
      practicalHours: course.practicalHours,
      theoreticalHours: course.theoreticalHours,
      maxAbsenceLimitPractical: course.maxAbsenceLimitPractical || 0,
      maxAbsenceLimitTheoretical: course.maxAbsenceLimitTheoretical || 0,
      fullAttendance: course.fullAttendance || 0,
    });

    setShowPracticalInput(course.practicalHours > 0);
    setShowTheoreticalInput(course.theoreticalHours > 0);
  };

  const handleUpdate = async () => {
    const totalHours = parseInt(form.practicalHours) + parseInt(form.theoreticalHours);

    const res = await fetch(`http://localhost:5000/api/Admin/update-course/${editId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...form, totalHours }),
    });

    if (res.ok) {
      await fetchCourses();
      setEditId(null);
    } else {
      alert("Failed to update course");
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white shadow rounded">
      <h2 className="text-2xl font-bold mb-6">Course List</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="w-full border-collapse border border-gray-300 text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2 text-left">Name</th>
              <th className="border p-2">Practical</th>
              <th className="border p-2">Theoretical</th>
              <th className="border p-2">Max Absence (P)</th>
              <th className="border p-2">Max Absence (T)</th>
              <th className="border p-2">Full Attendance</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50">
                {editId === c.id ? (
                  <>
                    <td className="border p-2">
                      <input
                        type="text"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="border rounded p-1 w-full"
                      />
                    </td>

                    {/* Practical Hours */}
                    <td className="border p-2 text-center">
                      {showPracticalInput ? (
                        <input
                          type="number"
                          value={form.practicalHours}
                          onChange={(e) =>
                            setForm({ ...form, practicalHours: +e.target.value })
                          }
                          className="border rounded p-1 w-full text-center"
                        />
                      ) : (
                        <button
                          className="text-blue-600 underline"
                          onClick={() => setShowPracticalInput(true)}
                        >
                          No practical hours. Add?
                        </button>
                      )}
                    </td>

                    {/* Theoretical Hours */}
                    <td className="border p-2 text-center">
                      {showTheoreticalInput ? (
                        <input
                          type="number"
                          value={form.theoreticalHours}
                          onChange={(e) =>
                            setForm({ ...form, theoreticalHours: +e.target.value })
                          }
                          className="border rounded p-1 w-full text-center"
                        />
                      ) : (
                        <button
                          className="text-blue-600 underline"
                          onClick={() => setShowTheoreticalInput(true)}
                        >
                          No theoretical hours. Add?
                        </button>
                      )}
                    </td>

                    {/* Max Absence Practical */}
                    <td className="border p-2 text-center">
                      {showPracticalInput ? (
                        <input
                          type="number"
                          value={form.maxAbsenceLimitPractical}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              maxAbsenceLimitPractical: +e.target.value,
                            })
                          }
                          className="border rounded p-1 w-full text-center"
                        />
                      ) : (
                        "-"
                      )}
                    </td>

                    {/* Max Absence Theoretical */}
                    <td className="border p-2 text-center">
                      {showTheoreticalInput ? (
                        <input
                          type="number"
                          value={form.maxAbsenceLimitTheoretical}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              maxAbsenceLimitTheoretical: +e.target.value,
                            })
                          }
                          className="border rounded p-1 w-full text-center"
                        />
                      ) : (
                        "-"
                      )}
                    </td>

                    <td className="border p-2 text-center">
                      <input
                        type="number"
                        value={form.fullAttendance}
                        onChange={(e) =>
                          setForm({ ...form, fullAttendance: +e.target.value })
                        }
                        className="border rounded p-1 w-full text-center"
                      />
                    </td>

                    <td className="border p-2 text-center space-x-2">
                      <button
                        onClick={handleUpdate}
                        className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditId(null)}
                        className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600"
                      >
                        Cancel
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="border p-2">{c.name}</td>
                    <td className="border p-2 text-center">
                      {c.practicalHours > 0 ? c.practicalHours : "-"}
                    </td>
                    <td className="border p-2 text-center">
                      {c.theoreticalHours > 0 ? c.theoreticalHours : "-"}
                    </td>
                    <td className="border p-2 text-center">
                      {c.practicalHours > 0 ? c.maxAbsenceLimitPractical : "-"}
                    </td>
                    <td className="border p-2 text-center">
                      {c.theoreticalHours > 0 ? c.maxAbsenceLimitTheoretical : "-"}
                    </td>
                    <td className="border p-2 text-center">{c.fullAttendance}</td>
                    <td className="border p-2 text-center">
                      <button
                        onClick={() => handleEditClick(c)}
                        className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                      >
                        Edit
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
