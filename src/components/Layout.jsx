import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'
import ToastHost from './ToastHost'
import SetupNotice from './SetupNotice'
import ScrollToTop from './ScrollToTop'

function Layout() {
  return (
    <div className="app-shell">
      <ScrollToTop />
      <SetupNotice />
      <Navbar />
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <main className="app-main" id="main-content" tabIndex={-1}>
        <Outlet />
      </main>
      <Footer />
      <ToastHost />
    </div>
  )
}

export default Layout
