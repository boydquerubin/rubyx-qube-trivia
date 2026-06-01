import React from "react";
import "../index.css";

const Footer = () => {
  const year = new Date().getFullYear();
  return (
    <footer className="footer">
      <div className="footer-inner">
        <span className="footer-brand">Rubyx Qube Trivia</span>
        <span className="footer-divider">·</span>
        <span>&copy; {year} Boyd Querubin. All rights reserved.</span>
      </div>
    </footer>
  );
};

export default Footer;
