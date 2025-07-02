import React from 'react';
import { Routes, Route } from 'react-router-dom';
import './index.css';

// Layout Component
import Layout from './components/Layout';

// Page Components
import Home from './pages/Home';
import UserProfile from './pages/UserProfile';
import About from './pages/About';
import Contact from './pages/Contact';
import Events from './pages/Event';
import EventDetailPage from './pages/EventDetailPage';
import BetSlipPage from './pages/BetSlipPage';
import BookedBetsPage from './pages/BookedBetsPage';
import WalletPage from './pages/WalletPage'; // Import WalletPage
import LiveEventPage from './pages/LiveEventPage'; // Import LiveEventPage
import SportsPage from './pages/SportsPage';


// Auth Page Components
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/Forgot-password';

// Helper Components
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Routes>
      {/* Routes that use the main_layout (Navbar, Footer, Hero) */}
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/event" element={<Events />} />
        <Route path="/event/:eventId" element={<EventDetailPage />} />
        <Route path="/betslip" element={<BetSlipPage />} />
        <Route path="/booked-bets" element={<BookedBetsPage />} />
        <Route path="/live" element={<LiveEventPage />} />
        <Route path="/sports" element={<SportsPage />} />
        
       
         <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <UserProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/wallet"
          element={
            <ProtectedRoute>
              <WalletPage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Auth routes - typically without the main layout */}
      <Route path="/login" element={<Login />}/>
      <Route path="/register" element={<Register />}/>
      <Route path="/forgot-password" element={<ForgotPassword />}/>

   
    </Routes>
  )
}


export default App;