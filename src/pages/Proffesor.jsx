import React, { useState, useEffect } from "react";
export default function Proffesor() {
  const [studentCount, setStudentCount] = useState(0);
  const [alertCount, setAlertCount] = useState(0);
  const [absenceCount, setAbsenceCount] = useState(0);
  const [courseCount] = useState(3);
  const [showStudentsMessage, setShowStudentsMessage] = useState(false);
  const [showAlertsMessage, setShowAlertsMessage] = useState(false);
  const [showAbsencesMessage, setShowAbsencesMessage] = useState(false);
  const [showCoursesMessage, setShowCoursesMessage] = useState(false);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [newStudentName, setNewStudentName] = useState("");

  // Utility to hide messages after 3 seconds
  function showMessage(setter) {
    setter(true);
    setTimeout(() => setter(false), 3000);
  }

  const handleAddStudentClick = () => {
    setShowAddStudentModal(true);
  };

  const handleShowAlerts = () => {
    setAlertCount(alertCount + 1);
    showMessage(setShowAlertsMessage);
  };

  const handleRegisterAbsences = () => {
    setAbsenceCount(absenceCount + 1);
    showMessage(setShowAbsencesMessage);
  };

  const handleViewCourses = () => {
    showMessage(setShowCoursesMessage);
  };

  const handleAddStudent = () => {
    if (newStudentName.trim()) {
      setStudentCount(studentCount + 1);
      showMessage(setShowStudentsMessage);
      setNewStudentName("");
      setShowAddStudentModal(false);
    } else {
      alert("يرجى إدخال اسم الطالب");
    }
  };

  const handleCloseModal = () => {
    setShowAddStudentModal(false);
  };

  // Close modal when clicking outside content
  useEffect(() => {
    function handleClickOutside(event) {
      if (event.target.id === "addStudentModal") {
        setShowAddStudentModal(false);
      }
    }
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <div dir="rtl" lang="ar">
      <header>
        <h1>مرحباً بك، أستاذ</h1>
      </header>

      <div>
        <button id="addStudentBtn" onClick={handleAddStudentClick}>إضافة طلاب</button>
        <button id="showAlertsBtn" onClick={handleShowAlerts}>إنذارات الطلاب</button>
        <button id="registerAbsencesBtn" onClick={handleRegisterAbsences}>تسجيل الغيابات</button>
        <button id="viewCoursesBtn" onClick={handleViewCourses}>المقررات الدراسية</button>
      </div>

      <div>
        <div id="studentsCard">
          <h3>الطلاب</h3>
          <p>عدد الطلاب المسجلين</p>
          <span id="studentCount">{studentCount}</span>
          {showStudentsMessage && <div id="studentsMessage">تم إضافة الطالب بنجاح!</div>}
        </div>
        <div id="alertsCard">
          <h3>الإنذارات</h3>
          <p>عدد الإنذارات الصادرة</p>
          <span id="alertCount">{alertCount}</span>
          {showAlertsMessage && <div id="alertsMessage">تم عرض الإنذارات.</div>}
        </div>
        <div id="absencesCard">
          <h3>الغيابات</h3>
          <p>إجمالي الغيابات المسجلة</p>
          <span id="absenceCount">{absenceCount}</span>
          {showAbsencesMessage && <div id="absencesMessage">تم تسجيل الغياب.</div>}
        </div>
        <div id="coursesCard">
          <h3>المقررات الدراسية</h3>
          <p>عدد المقررات المكلف بها</p>
          <span id="courseCount">{courseCount}</span>
          {showCoursesMessage && (
            <div id="coursesMessage">
              المقررات الدراسية: المنطق العائم، دارات منطقية، تحليل رياضي
            </div>
          )}
        </div>
      </div>

      {/* Modal for Adding Students */}
      {showAddStudentModal && (
        <div
          id="addStudentModal"
          style={{
            display: "flex",
            position: "fixed",
            inset: 0,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0,0,0,0.5)",
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: 20,
              borderRadius: 8,
              position: "relative",
              minWidth: 300,
            }}
          >
            <span
              id="closeAddStudentModal"
              style={{
                position: "absolute",
                top: 10,
                right: 15,
                cursor: "pointer",
                fontSize: 24,
              }}
              onClick={handleCloseModal}
            >
              ×
            </span>
            <h2>إضافة طالب جديد</h2>
            <input
              type="text"
              id="studentName"
              placeholder="أدخل اسم الطالب الكامل"
              value={newStudentName}
              onChange={(e) => setNewStudentName(e.target.value)}
            />
            <button className="action-button" onClick={handleAddStudent}>
              إضافة الطالب
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
