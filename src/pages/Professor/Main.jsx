import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaBook, FaClock } from "react-icons/fa";


export default function ProfessorCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const {professorId} = useParams();
  
  useEffect(() => {
    async function fetchCourses() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `http://localhost:5000/api/Admin/professor/${professorId}/professor-courses`
        );
        if (!res.ok) throw new Error("Failed to fetch courses");
        const data = await res.json();
        setCourses(data);
        console.log(data);
      } catch (err) {
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    }
    fetchCourses();
  }, []);

  // Navigate to course page
  function goToCourse(courseId) {
    navigate(`/courses/${courseId}`);
  }

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white shadow-xl rounded-2xl mt-16">
      <h1 className="text-4xl font-extrabold mb-8 text-center text-gray-900 tracking-wide">
        My Courses
      </h1>

      {loading && (
        <p className="text-center text-gray-500 text-lg italic animate-pulse">
          Loading courses...
        </p>
      )}

      {error && (
        <p className="text-center text-red-600 font-semibold text-lg">
          {error}
        </p>
      )}

      {!loading && !error && (
        <>
          {courses.length === 0 ? (
            <p className="text-center text-gray-600 italic text-lg">
              No courses assigned.
            </p>
          ) : (
            <ul className="space-y-6">
              {courses.map((course) => {
                const hours = [];
                if (course.theoreticalN > 0)
                  hours.push(`${course.theoreticalN}فئة Theory`);
                if (course.practicalN > 0)
                  hours.push(`${course.practicalN}زمرة  Practical`);
                const hoursDisplay = hours.join(" / ");

                return (
                  <li
                    key={course.professorCourseId || course.courseId}
                    className="flex flex-col gap-4 p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-lg transition-shadow duration-300"
                  >
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                      <div className="flex items-center space-x-4 mb-3 md:mb-0">
                        <FaBook className="text-indigo-600 w-7 h-7" />
                        <span className="text-xl font-semibold text-gray-800">
                          {course.courseName}
                        </span>
                      </div>
                      {hoursDisplay && (
                        <div className="flex items-center space-x-2 text-gray-600 text-sm md:text-base">
                          <FaClock />
                          <span>{hoursDisplay}</span>
                        </div>
                      )}
                    </div>

                    {/* Add Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-6">
                      <button
                        onClick={() =>
                          navigate(
                            `/professor-courses/${course.professorCourseId}/students?type=${course.theoreticalN > 0? "Theory" :"Practical"}`
                          )
                        }
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-xl transition duration-300"
                      >
                        Show Students
                      </button>

                      <button
                        onClick={() =>
                          navigate(
                            `/professor-courses/${course.professorCourseId}/assign`
                          )
                        }
                        className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-xl transition duration-300"
                      >
                        Assign Student
                      </button>
                      <button
                        onClick={() =>
                          navigate(
                            `/professor-courses/${course.professorCourseId}/attendance`
                          )
                        }
                        className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-xl transition duration-300"
                      >
                        Add Attendance
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
