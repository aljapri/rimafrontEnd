import React, { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { FaBell } from "react-icons/fa";

const API_BASE = "http://localhost:5000";

export default function ProfessorCourseDetails() {
  const { professorCourseId } = useParams();
  const [studentsBasic, setStudentsBasic] = useState([]);
  const [studentsDetailed, setStudentsDetailed] = useState([]);
  const [courseId, setCourseId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [deletingStudentId, setDeletingStudentId] = useState(null);
  const [deletingDate, setDeletingDate] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [forbiddenStudents, setForbiddenStudents] = useState([]);
  const [limitStudents, setLimitStudents] = useState([]);
  const [searchParams] = useSearchParams();
  const type = searchParams.get("type");
  const isTheory = type == "Theory";

  // Filters
  const [filterName, setFilterName] = useState("");
  const [filterAbsenceCount, setFilterAbsenceCount] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterDate, setFilterDate] = useState("");

  const getStudentStatus = (student) => {
    const practical =
      student.practicalAbsences *
      student.courseDetails.maxAbsenceLimitPractical;
    const theoretical =
      student.theoreticalAbsences *
      student.courseDetails.maxAbsenceLimitTheoretical;
    const total = practical + theoretical;
    const limit = student.courseDetails.fullAttendance;

    if (total > limit) return "محروم";
    if (total === limit) return "على الحد";
    return "نظامي";
  };

  const findSpecialCases = (students) => {
    const forbidden = [];
    const limit = [];

    students.forEach((student) => {
      // Only consider students registered in this course
      if (
        !student.professorCourseIds ||
        !student.professorCourseIds.includes(String(professorCourseId))
      ) {
        return;
      }

      const practical =
        student.practicalAbsences *
        student.courseDetails.maxAbsenceLimitPractical;
      const theoretical =
        student.theoreticalAbsences *
        student.courseDetails.maxAbsenceLimitTheoretical;
      const total = practical + theoretical;
      const limitValue = student.courseDetails.fullAttendance;

      if (total > limitValue) {
        forbidden.push(student);
      } else if (total === limitValue) {
        limit.push(student);
      }
    });

    return { forbidden, limit };
  };

  const fetchCourseId = async () => {
    try {
      const res = await fetch(
        `${API_BASE}/api/Professor/professor-course/${professorCourseId}`
      );
      const data = await res.json();
      setCourseId(data.courseId);
    } catch (err) {
      setError("فشل في تحميل بيانات الكورس");
    }
  };

  const fetchStudentsBasic = async () => {
    try {
      const res = await fetch(
        `${API_BASE}/api/Professor/professor-course/${professorCourseId}/students`
      );
      const data = await res.json();
      setStudentsBasic(data);
    } catch (err) {
      setError("فشل في تحميل الطلاب");
    }
  };

  const fetchStudentSummaries = async () => {
    if (!courseId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `${API_BASE}/api/Professor/course/${courseId}/students-full-summary`
      );
      if (!res.ok) throw new Error("Failed to fetch student summaries");
      const data = await res.json();
      setStudentsDetailed(data);
      const { forbidden, limit } = findSpecialCases(data);
      setForbiddenStudents(forbidden);
      setLimitStudents(limit);
    } catch (err) {
      setError("فشل في تحميل ملخص الغياب");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAbsenceByDate = async (studentId, date, type) => {
    if (!window.confirm("هل أنت متأكد من حذف سجل الغياب لهذا التاريخ؟")) return;
    if (!courseId) return;

    setDeletingStudentId(studentId);
    setDeletingDate(date);
    setError(null);
    setSuccessMessage(null);

    try {
      const res = await fetch(
        `${API_BASE}/api/Professor/attendance/delete-by-date?studentId=${studentId}&sessionDate=${date}&professorCourseId=${professorCourseId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "فشل في حذف الغياب");
      }

      setSuccessMessage("تم حذف سجل الغياب بنجاح");
      setTimeout(() => setSuccessMessage(null), 3000);
      await fetchStudentSummaries();
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(null), 5000);
    } finally {
      setDeletingStudentId(null);
      setDeletingDate(null);
    }
  };

  useEffect(() => {
    if (!professorCourseId) return;
    fetchCourseId();
    fetchStudentsBasic();
  }, [professorCourseId]);

  useEffect(() => {
    if (courseId) fetchStudentSummaries();
  }, [courseId]);

  const filteredStudents = studentsDetailed.filter((student) => {
    // Make sure the student is registered in this course
    if (
      !student.professorCourseIds ||
      !student.professorCourseIds.includes(String(professorCourseId))
    ) {
      return false;
    }

    const status = getStudentStatus(student);

    return (
      student.fullName.toLowerCase().includes(filterName.toLowerCase()) &&
      (filterAbsenceCount === "" ||
        student.totalAbsences === Number(filterAbsenceCount)) &&
      (filterStatus === "" || status === filterStatus) &&
      (filterDate === "" ||
        student.practicalAbsenceDates.includes(filterDate) ||
        student.theoreticalAbsenceDates.includes(filterDate))
    );
  });

  return (
    <div className="max-w-5xl mx-auto p-8 bg-white rounded-xl shadow-lg mt-12">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-indigo-800">
          الطلاب المسجلون في الكورس
        </h1>

        {/* Notification Bell - Always Visible */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 relative"
          >
            <FaBell className="text-xl" />
            {(forbiddenStudents.length > 0 || limitStudents.length > 0) && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {forbiddenStudents.length + limitStudents.length}
              </span>
            )}
          </button>

          {/* Notification Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg z-10 border border-gray-200">
              <div className="p-2">
                {forbiddenStudents.length > 0 ? (
                  <div className="mb-3">
                    <h3 className="font-bold text-red-600 mb-1">
                      طلاب محرومين ({forbiddenStudents.length})
                    </h3>
                    <ul className="text-sm max-h-40 overflow-y-auto">
                      {forbiddenStudents.map((student) => (
                        <li
                          key={student.studentId}
                          className="py-1 border-b border-gray-100"
                        >
                          {student.fullName}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm py-2">
                    لا يوجد طلاب محرومين
                  </p>
                )}

                {limitStudents.length > 0 ? (
                  <div>
                    <h3 className="font-bold text-yellow-600 mb-1">
                      طلاب على الحد المسموح ({limitStudents.length})
                    </h3>
                    <ul className="text-sm max-h-40 overflow-y-auto">
                      {limitStudents.map((student) => (
                        <li
                          key={student.studentId}
                          className="py-1 border-b border-gray-100"
                        >
                          {student.fullName}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm py-2">
                    لا يوجد طلاب على الحد المسموح
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Success and error messages */}
      {successMessage && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
          {successMessage}
        </div>
      )}
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>
      )}

      {/* 🔍 Filters interface */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <input
          type="text"
          placeholder="فلترة بالاسم..."
          value={filterName}
          onChange={(e) => setFilterName(e.target.value)}
          className="border px-3 py-2 rounded"
        />
        <input
          type="number"
          placeholder="عدد الغيابات"
          value={filterAbsenceCount}
          onChange={(e) => setFilterAbsenceCount(e.target.value)}
          className="border px-3 py-2 rounded"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border px-3 py-2 rounded"
        >
          <option value="">جميع الحالات</option>
          <option value="نظامي">نظامي</option>
          <option value="على الحد">على الحد</option>
          <option value="محروم">محروم</option>
        </select>
        <input
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          className="border px-3 py-2 rounded"
        />
      </div>

      {loading && <p className="text-gray-500 italic">جاري التحميل...</p>}

      <h2 className="text-2xl font-bold text-indigo-700 mb-4">تفاصيل الغياب</h2>

      {filteredStudents.length === 0 ? (
        <p className="text-gray-500">لا توجد نتائج تطابق الفلاتر.</p>
      ) : (
        <div className="grid gap-6">
          {filteredStudents.map((student, idx) => {
            const status = getStudentStatus(student);
            const statusColors = {
              نظامي: "bg-green-100 text-green-700",
              "على الحد": "bg-yellow-100 text-yellow-700",
              محروم: "bg-red-100 text-red-700",
            };

            return (
              <div
                key={student.studentId}
                className="bg-gray-50 border border-gray-300 rounded-lg p-5 shadow"
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-semibold text-indigo-800">
                    {idx + 1}. {student.fullName}
                  </h3>
                  <span
                    className={`text-sm font-bold px-2 py-1 rounded ${statusColors[status]}`}
                  >
                    {status}
                  </span>
                </div>

                <p className="text-sm text-gray-700 mb-2">
                  البريد الإلكتروني: <strong>{student.email}</strong>
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    {student.practicalAbsences > 0 && (
                      <>
                        <p>عدد الغيابات العملي: {student.practicalAbsences}</p>
                        <p className="font-medium mt-2">
                          تواريخ الغياب العملي:
                        </p>
                        <ul className="list-disc list-inside text-xs text-gray-600">
                          {student.practicalAbsenceDates.map((date, i) => (
                            <li key={i}>{date}</li>
                          ))}
                        </ul>
                      </>
                    )}

                    {student.theoreticalAbsences > 0 && (
                      <>
                        <p className="mt-4">
                          عدد الغيابات النظري: {student.theoreticalAbsences}
                        </p>
                        <p className="font-medium mt-2">
                          تواريخ الغياب النظري:
                        </p>
                        <ul className="list-disc list-inside text-xs text-gray-600">
                          {student.attendances &&
                            student.attendances
                              .filter((att) => att.type === "نظري") // تصفية فقط الغيابات النظرية
                              .map((attendance, i) => (
                                <li
                                  key={i}
                                  className="flex items-center justify-between"
                                >
                                  <span>{attendance.date}</span>
                                  {/* عرض زر الحذف فقط إذا تطابق professorCourseId */}
                                  {attendance.professorCourseId ===
                                    professorCourseId && (
                                    <button
                                      onClick={() =>
                                        handleDeleteAbsenceByDate(
                                          student.studentId,
                                          attendance.date,
                                          "theoretical"
                                        )
                                      }
                                      disabled={
                                        deletingStudentId ===
                                          student.studentId &&
                                        deletingDate === attendance.date
                                      }
                                      className={`text-xs px-2 py-1 rounded ${
                                        deletingStudentId ===
                                          student.studentId &&
                                        deletingDate === attendance.date
                                          ? "bg-gray-200 text-gray-500"
                                          : "bg-red-100 text-red-600 hover:bg-red-200"
                                      }`}
                                    >
                                      {deletingStudentId ===
                                        student.studentId &&
                                      deletingDate === attendance.date
                                        ? "جارٍ الحذف..."
                                        : "حذف"}
                                    </button>
                                  )}
                                </li>
                              ))}
                        </ul>
                      </>
                    )}

                    <p className="mt-4">
                      إجمالي الغيابات: {student.totalAbsences}
                    </p>
                    <p>الحد المسموح: {student.courseDetails.fullAttendance}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
