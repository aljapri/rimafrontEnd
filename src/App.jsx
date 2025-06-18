import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Layout from "./Layout";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Student from "./pages/Student";
import Professor from "./pages/Proffesor";
import AdminLayout from "./pages/Admin/AdminLayout";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import ProfessorsList from "./pages/Admin/ProfessorsList";
import CreateProfessor from "./pages/Admin/CreateProfessor";
import CreateStudent from "./pages/Admin/CreateStudent";
import StudentsList from "./pages/Admin/StudentsList";
import CreateCourse from "./pages/Admin/CreateCouse";
import ListCourses from "./pages/Admin/ListCourses";
import AssignCourse from "./pages/Admin/AssignCourse";
import ProfessorCoursesView from "./pages/Admin/ProfessorCourses";

// Admin pages
// import AdminDashboard from "./pages/Admin/AdminDashboard";
// import ProfessorsList from "./Admin/ProfessorsList";
// import CreateProfessor from "./Admin/CreateProfessor";
// import Courses from "./Admin/Courses";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public site */}
        <Route path="/" element={<Layout />}>
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="student" element={<Student />} />
          <Route path="professor" element={<Professor />} />
        </Route>

        {/* Admin site */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<ProfessorsList />} />
          <Route path="professors" element={<ProfessorsList />} />
          <Route path="create-professor" element={<CreateProfessor />} />
          <Route path="create-student" element={<CreateStudent />} />
          <Route path="students" element={<StudentsList />} />
          <Route path="create-course" element={<CreateCourse />} />
          <Route path="courses" element={<ListCourses />} />
          <Route path="assign-course" element={<AssignCourse />} />
          {/* <Route path="professor-course" element={<ProfessorCoursesView />} /> */}

          
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
