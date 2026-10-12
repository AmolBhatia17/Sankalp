import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { EnrollmentProvider } from './context/EnrollmentContext';
import { UIProvider } from './context/UIContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import ExploreCourses from './pages/ExploreCourses';
import CourseOverview from './pages/CourseOverview';
import LecturePlayer from './pages/LecturePlayer';
import MyLearning from './pages/MyLearning';
import InstructorStudio from './pages/InstructorStudio';

function SimplePage({ title, children }) {
  return (
    <div className="mx-auto max-w-3xl px-6 py-24 text-center">
      <h1 className="font-display text-4xl font-extrabold">{title}</h1>
      <p className="mt-4 text-on-surface-variant">{children}</p>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <EnrollmentProvider>
          <Router>
            <UIProvider>
              <div className="flex min-h-screen flex-col">
                <Navbar />
                <main className="flex-1 pt-20">
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/courses" element={<ExploreCourses />} />
                    <Route path="/courses/:courseId" element={<CourseOverview />} />
                    <Route path="/learn/:courseId/:lectureId?" element={<LecturePlayer />} />
                    <Route path="/my-learning" element={<MyLearning />} />
                    <Route path="/studio" element={<InstructorStudio />} />
                    <Route
                      path="/about"
                      element={
                        <SimplePage title="About Sankalp">
                          Sankalp is a collegiate-grade learning platform delivering research lectures, labs
                          and validated professional credentials.
                        </SimplePage>
                      }
                    />
                    <Route
                      path="/contact"
                      element={
                        <SimplePage title="Contact Support">
                          Reach the academic office at support@sankalp.edu — we reply within one working day.
                        </SimplePage>
                      }
                    />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </main>
                <Footer />
              </div>
            </UIProvider>
          </Router>
        </EnrollmentProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
