import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Home from "./components/Home";
import logo from "./assets/logo.png";
import Footer from "./components/Footer";
import "./App.css";
import "./index.css";

function App() {
  return (
    <BrowserRouter>
      <div className="page-container">
        <nav>
          <div className="nav-links">
            <Link to="/" className="navbar-brand mb-0 h1">
              <img
                src={logo}
                width="60"
                height="60"
                alt="Rubyx Qube Logo"
                className="logo"
              />
              <h1>Rubyx Qube Trivia</h1>
            </Link>
          </div>
        </nav>

        <div className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
          </Routes>
        </div>

        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
