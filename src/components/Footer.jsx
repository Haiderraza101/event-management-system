import './Footer.css'

function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <p className="faint">Eventide — built with React, Redux Toolkit and React Router.</p>
        <p className="faint">
          Event data provided by{' '}
          <a href="https://developer.ticketmaster.com/" target="_blank" rel="noreferrer">
            Ticketmaster Discovery API
          </a>
        </p>
      </div>
    </footer>
  )
}

export default Footer
