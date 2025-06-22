import React, { useEffect, useState } from "react";

export default function AssignCourse() {
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [professors, setProfessors] = useState([]);
  const [message, setMessage] = useState("");
  const [assignmentType, setAssignmentType] = useState({
    practical: false,
    theoretical: false,
  });
  const [practicalN, setPracticalN] = useState(0);
  const [theoreticalN, setTheoreticalN] = useState(0);

  const fetchCourses = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/Admin/courses");
      const data = await res.json();
      setCourses(data);
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  const fetchProfessors = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/Admin/professors");
      const data = await res.json();
      setProfessors(data);
    } catch (error) {
      console.error("Error fetching professors:", error);
    }
  };

  const handleCourseChange = (e) => {
    const courseId = e.target.value;
    setSelectedCourseId(courseId);

    const course = courses.find((c) => c.id.toString() === courseId);
    setSelectedCourse(course);

    // Reset selection
    if (course) {
      const canPractical = course.practicalHours > 0;
      const canTheoretical = course.theoreticalHours > 0;

      setAssignmentType({
        practical: canPractical && !canTheoretical,
        theoretical: canTheoretical && !canPractical,
      });

      setPracticalN(0);
      setTheoreticalN(0);
    }
  };

  const handleAssign = async (professorId) => {
    if (!assignmentType.practical && !assignmentType.theoretical) {
      setMessage("يرجى تحديد نوع التكليف: عملي أو نظري.");
      return;
    }
    if (assignmentType.practical && practicalN <= 0) {
      setMessage("يرجى إدخال عدد الحصص العملية بشكل صحيح.");
      return;
    }
    if (assignmentType.theoretical && theoreticalN <= 0) {
      setMessage("يرجى إدخال عدد الحصص النظرية بشكل صحيح.");
      return;
    }

    try {
      const res = await fetch(
        "http://localhost:5000/api/Admin/assign-professor-to-course",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            professorId,
            courseId: selectedCourseId,
            practical: assignmentType.practical,
            theoretical: assignmentType.theoretical,
            practicalN: assignmentType.practical ? practicalN : 0,
            theoreticalN: assignmentType.theoretical ? theoreticalN : 0,
          }),
        }
      );

      if (res.ok) {
        setMessage("تم تعيين الأستاذ للمقرر بنجاح.");
      } else {
        const err = await res.text();
        setMessage("حدث خطأ: " + err);
      }
    } catch (error) {
      setMessage("فشل الاتصال بالخادم.");
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourseId) fetchProfessors();
  }, [selectedCourseId]);

  return (
    <div
      className="max-w-4xl mx-auto p-6 bg-white shadow rounded"
      dir="rtl"
      lang="ar"
    >
      <h2 className="text-2xl font-bold mb-6">تعيين أستاذ لمقرر</h2>

      <div className="mb-6">
        <label className="block mb-2 font-medium">اختر المقرر</label>
        <select
          className="w-full border px-3 py-2 rounded"
          value={selectedCourseId || ""}
          onChange={handleCourseChange}
        >
          <option value="">-- اختر المقرر --</option>
          {courses.map((course) => {
            const parts = [];
            if (course.theoreticalHours > 0)
              parts.push(`${course.theoreticalHours} نظري`);
            if (course.practicalHours > 0)
              parts.push(`${course.practicalHours} عملي`);
            return (
              <option key={course.id} value={course.id}>
                {course.name} ({parts.join(" / ")})
              </option>
            );
          })}
        </select>
      </div>

      {selectedCourse && (
        <div className="mb-6">
          <label className="block font-medium mb-2">نوع التكليف</label>
          <div className="flex gap-4 mb-3">
            {selectedCourse.practicalHours > 0 && (
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={assignmentType.practical}
                  onChange={(e) =>
                    setAssignmentType({
                      ...assignmentType,
                      practical: e.target.checked,
                    })
                  }
                />{" "}
                عملي
              </label>
            )}

            {selectedCourse.theoreticalHours > 0 && (
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={assignmentType.theoretical}
                  onChange={(e) =>
                    setAssignmentType({
                      ...assignmentType,
                      theoretical: e.target.checked,
                    })
                  }
                />{" "}
                نظري
              </label>
            )}
          </div>

          {assignmentType.practical && (
            <div className="mb-2">
              <label className="block mb-1 font-medium">زمرة</label>
              <input
                type="number"
                className="border px-3 py-1 rounded w-full"
                placeholder="عدد الحصص العملية"
                value={practicalN}
                onChange={(e) => setPracticalN(Number(e.target.value))}
              />
            </div>
          )}

          {assignmentType.theoretical && (
            <div className="mb-2">
              <label className="block mb-1 font-medium">فئة</label>
              <input
                type="number"
                className="border px-3 py-1 rounded w-full"
                placeholder="عدد الحصص النظرية"
                value={theoreticalN}
                onChange={(e) => setTheoreticalN(Number(e.target.value))}
              />
            </div>
          )}
        </div>
      )}

      {selectedCourseId && (
        <div>
          <h3 className="text-xl font-semibold mb-4">الأساتذة المتاحون</h3>
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
                  تعيين
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {message && (
        <p
          className={`mt-4 font-semibold ${
            message.includes("نجاح") || message.includes("تم")
              ? "text-green-600"
              : "text-red-600"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
