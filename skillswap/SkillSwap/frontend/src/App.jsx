import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { TokenProvider } from './context/TokenContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import LectureDetails from './pages/LectureDetails';
import TeachLecture from './pages/TeachLecture';
import Subscription from './pages/Subscription';
import Profile from './pages/Profile';
import About from './pages/About';
import HowItWorks from './pages/HowItWorks';
import Services from './pages/Services';
import Contact from './pages/Contact';
import Feedback from './pages/Feedback';
import Blog from './pages/Blog';
import Info from './pages/Info';

const App = () => {
  return (
    <AuthProvider>
      <ThemeProvider>
        <TokenProvider>
          <Router>
            <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/lectures/:id" element={<LectureDetails />} />
              <Route path="/teach" element={<TeachLecture />} />
              <Route path="/subscription" element={<Subscription />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/about" element={<About />} />
              <Route path="/how-it-works" element={<HowItWorks />} />
              <Route path="/services" element={<Services />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/feedback" element={<Feedback />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/info" element={<Info />} />
            </Routes>
            <Footer />
          </Router>
        </TokenProvider>
      </ThemeProvider>
    </AuthProvider>
  );
};

export default App;