import React, { useEffect, useState } from "react";

export default function ProfessorCoursesView() {
  const [professors, setProfessors] = useState([]);
  const [selectedProfessorId, setSelectedProfessorId] = useState(null);
  const [courses, setCourses] = useState([]);

  const fetchProfessors = async () => {
    const res = await fetch("http://localhost:5000/api/Admin/professors");
    const data = await res.json();
    setProfessors(data);
  };

  const fetchCoursesForProfessor = async (professorId) => {
    const res = await fetch(`http://localhost:5000/api/Admin/professor/${professorId}/courses`);
    const data = await res.json();
    setCourses(data);
  };

  const handleSelectProfessor = (professorId) => {
    setSelectedProfessorId(professorId);
    fetchCoursesForProfessor(professorId);
  };

  useEffect(() => {
    fetchProfessors();
  }, []);

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white shadow rounded">
      <h2 className="text-2xl font-bold mb-6">Professors and Their Courses</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-xl font-semibold mb-4">Professors</h3>
          <ul className="space-y-3">
            {professors.map((prof) => (
              <li
                key={prof.userId}
                className={`p-4 border rounded shadow-sm cursor-pointer hover:bg-gray-100 ${
                  selectedProfessorId === prof.userId ? "bg-blue-100" : ""
                }`}
                onClick={() => handleSelectProfessor(prof.userId)}
              >
                <p className="font-medium">{prof.fullName}</p>
                <p className="text-sm text-gray-600">{prof.specialization}</p>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-4">Courses</h3>
          {selectedProfessorId ? (
            courses.length > 0 ? (
              <ul className="space-y-3">
                {courses.map((course) => (
                  <li key={course.id} className="p-4 border rounded shadow-sm">
                    <p className="font-medium">{course.name}</p>
                    <p className="text-sm text-gray-600">
                      {course.theoreticalHours} Theoretical / {course.practicalHours} Practical
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No courses assigned to this professor.</p>
            )
          ) : (
            <p>Select a professor to view their courses.</p>
          )}
        </div>
      </div>
    </div>
  );
}
