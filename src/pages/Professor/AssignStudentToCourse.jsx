import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import * as XLSX from "xlsx";

const API_BASE = "http://localhost:5000";

export default function AssignStudentToCourse() {
  const { professorCourseId } = useParams();

  const [students, setStudents] = useState([]); // من قاعدة البيانات
  const [excelStudents, setExcelStudents] = useState([]); // من ملف Excel
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [assigningId, setAssigningId] = useState(null);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [showStudentsList, setShowStudentsList] = useState(false); // حالة إظهار/إخفاء القائمة

  useEffect(() => {
    fetchStudents();
  }, []);

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

  function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];

      const rows = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
        defval: "",
      });

      const dataRows = rows.slice(1);

      const mappedStudents = dataRows.map((row, index) => {
        const userIdFromExcel = row[0] || `excel-${index}`;
        const idNumber = String(row[1] || "").trim();
        const fullNameExcel = String(row[2] || "").trim();
        const emailFromExcel = idNumber ? `${idNumber}@gmail.com` : "";

        const foundInDB = students.find(
          (dbStudent) =>
            dbStudent.email.trim().toLowerCase() === emailFromExcel.toLowerCase()
        );

        if (foundInDB) {
          return {
            userId: foundInDB.userId,
            fullName: fullNameExcel || foundInDB.fullName,
            email: foundInDB.email,
            userName: foundInDB.email,
            emailConfirmed: foundInDB.emailConfirmed || false,
            fromExcel: true,
            existsInDB: true,
          };
        }

        return {
          userId: userIdFromExcel,
          fullName: fullNameExcel,
          email: emailFromExcel,
          userName: emailFromExcel,
          emailConfirmed: false,
          fromExcel: true,
          existsInDB: false,
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

      {/* <div className="mb-6 text-center">
        <button
          onClick={fetchStudents}
          className="px-6 py-3 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          disabled={loadingStudents}
        >
          {loadingStudents
            ? "جارٍ تحميل الطلاب..."
            : "جلب الطلاب من قاعدة البيانات"}
        </button>
      </div> */}

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

      {/* عنوان قابل للنقر لإظهار أو إخفاء قائمة الطلاب */}
      <section className="mb-10">
        <h2
          onClick={() => setShowStudentsList(!showStudentsList)}
          className="text-2xl font-semibold mb-4 text-indigo-600 cursor-pointer select-none hover:text-indigo-800"
          role="button"
          aria-expanded={showStudentsList}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              setShowStudentsList(!showStudentsList);
            }
          }}
        >
          طلاب من قاعدة البيانات {showStudentsList ? "▲" : "▼"}
        </h2>

        {showStudentsList && (
          <>
            {students.length === 0 && !loadingStudents ? (
              <p className="text-center text-gray-600 italic">
                لم يتم جلب أي طلاب بعد.
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
          </>
        )}
      </section>

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
                  <p className="font-semibold text-gray-800">{student.fullName}</p>
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
