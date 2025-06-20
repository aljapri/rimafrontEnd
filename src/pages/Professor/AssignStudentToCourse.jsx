import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import * as XLSX from "xlsx";

const API_BASE = "http://localhost:5000";

export default function AssignStudentToCourse() {
  const { professorCourseId } = useParams();

  const [students, setStudents] = useState([]); // from DB
  const [excelStudents, setExcelStudents] = useState([]); // from Excel file
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [assigningId, setAssigningId] = useState(null);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Fetch all students on mount (from DB)
  useEffect(() => {
    async function fetchStudents() {
      setLoadingStudents(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/api/Admin/Students`);
        if (!res.ok) throw new Error("فشل في تحميل الطلاب");
        const data = await res.json();
        setStudents(data);
      } catch (err) {
        setError(err.message || "حدث خطأ");
      } finally {
        setLoadingStudents(false);
      }
    }

    fetchStudents();
  }, []);

  // Assign a student to the professor course
  async function assignStudent(userId) {
    setAssigningId(userId);
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await fetch(
        `${API_BASE}/api/Professor/assign-student-to-professor-course`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ studentId: userId, professorCourseId }),
        }
      );

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData || "فشل في التسجيل");
      }

      setSuccessMsg("تم تسجيل الطالب بنجاح.");
    } catch (err) {
      setError(err.message || "حدث خطأ أثناء التسجيل");
    } finally {
      setAssigningId(null);
    }
  }

  // Handle Excel file upload and parsing
  function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];

      // Parse as array of arrays to avoid wrong keys
      const rows = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
        defval: "",
      });

      // Assuming first row is header row, skip it; otherwise remove slice(1)
      const dataRows = rows.slice(1);

      const mappedStudents = dataRows.map((row, index) => {
        const id = row[0] || `excel-${index}`;
        const idNumber = String(row[1] || "").trim();
        const fullName = String(row[2] || "").trim();

        return {
          userId: id,
          email: idNumber ? `${idNumber}@gmail.com` : "",
          fullName,
          fromExcel: true,
        };
      });

      setExcelStudents(mappedStudents);
    };
    reader.readAsArrayBuffer(file);
  }

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white rounded-xl shadow-md mt-12 font-sans">
      <h1 className="text-3xl font-bold mb-6 text-center text-indigo-700">
        تسجيل طلاب في الكورس
      </h1>

      {/* File upload for Excel */}
      <div className="mb-6">
        <label className="block mb-2 font-semibold text-gray-700">
          رفع ملف Excel (.xlsx)
        </label>
        <input
          type="file"
          accept=".xlsx, .xls"
          onChange={handleFileUpload}
          className="border p-2 rounded"
        />
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>
      )}
      {successMsg && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
          {successMsg}
        </div>
      )}

      {/* List of students from DB */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4 text-indigo-600">
          طلاب من قاعدة البيانات
        </h2>
        {loadingStudents ? (
          <p className="text-center text-gray-600 italic animate-pulse">
            جاري تحميل الطلاب...
          </p>
        ) : students.length === 0 ? (
          <p className="text-center text-gray-600 italic">
            لا يوجد طلاب في قاعدة البيانات.
          </p>
        ) : (
          <ul className="space-y-3">
            {students.map((student) => (
              <li
                key={student.userId}
                className="flex justify-between items-center border border-gray-300 rounded p-3 hover:shadow-sm"
              >
                <div>
                  <p className="font-semibold text-gray-800">
                    {student.fullName}
                  </p>
                  <p className="text-gray-600 text-sm">{student.email}</p>
                </div>
                <button
                  disabled={assigningId === student.userId}
                  onClick={() => assignStudent(student.userId)}
                  className={`px-4 py-2 rounded text-white ${
                    assigningId === student.userId
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-indigo-600 hover:bg-indigo-700"
                  }`}
                >
                  {assigningId === student.userId ? "جارٍ التسجيل..." : "تسجيل"}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* List of students from Excel */}
      <section>
        <h2 className="text-2xl font-semibold mb-4 text-indigo-600">
          طلاب من ملف Excel
        </h2>
        {excelStudents.length === 0 ? (
          <p className="text-center text-gray-600 italic">
            لم يتم رفع أي ملف بعد.
          </p>
        ) : (
          <ul className="space-y-3">
            {excelStudents.map((student) => (
              <li
                key={student.userId}
                className="flex justify-between items-center border border-gray-300 rounded p-3 hover:shadow-sm"
              >
                <div>
                  <p className="font-semibold text-gray-800">
                    {student.fullName}
                  </p>
                  <p className="text-gray-600 text-sm">{student.email}</p>
                </div>
                <button
                  disabled={assigningId === student.userId}
                  onClick={() => assignStudent(student.userId)}
                  className={`px-4 py-2 rounded text-white ${
                    assigningId === student.userId
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-indigo-600 hover:bg-indigo-700"
                  }`}
                >
                  {assigningId === student.userId ? "جارٍ التسجيل..." : "تسجيل"}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
