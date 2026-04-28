import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import NavBar from './components/NavBar'
import SideNav from './components/SideNav'
import Credit from './components/Credit'
import LandingPage from './pages/LandingPage'
import UKPage from './pages/UKPage'
import USAPage from './pages/USAPage'
import FrancePage from './pages/FrancePage'
import GermanyPage from './pages/GermanyPage'
import PhilippinesPage from './pages/PhilippinesPage'

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <div className="app">
          <NavBar />
          <div className="app__body">
            <main className="app__main">
              <div className="app__content">
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/uk" element={<UKPage />} />
                  <Route path="/usa" element={<USAPage />} />
                  <Route path="/france" element={<FrancePage />} />
                  <Route path="/germany" element={<GermanyPage />} />
                  <Route path="/philippines" element={<PhilippinesPage />} />
                </Routes>
              </div>
              <Credit />
            </main>
            <SideNav />
          </div>
        </div>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
