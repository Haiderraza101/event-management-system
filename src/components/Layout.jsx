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
      <main className="app-main">
        <Outlet />
      </main>
      <Footer />
      <ToastHost />
    </div>
  )
}

export default Layout
