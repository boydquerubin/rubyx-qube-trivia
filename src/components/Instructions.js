import React from "react";
import "./Instructions.css";

const Instructions = ({ isOpen, onClose, onBegin }) => {
  if (!isOpen) return null;

  return (
    <div className="instructions-modal-overlay">
      <div className="instructions-modal-content">
        <div className="instructions-header">
          <h2>RUBYX QUBE</h2>
          <p>How to Play</p>
        </div>
        <ul>
          <li>
            <strong>60 seconds</strong> on the clock — score as many points as
            you can before time runs out.
          </li>
          <li>
            <strong>Pick a category</strong> to get a question. Categories don't
            reset, so mix it up!
          </li>
          <li>
            <strong>Each correct answer</strong> is worth 1 point. Wrong answers
            cost nothing — keep going.
          </li>
          <li>
            <strong>When time's up</strong>, enter your name to claim your spot
            on the leaderboard.
          </li>
        </ul>
        <h3>Good luck!</h3>
        <div className="instructions-buttons">
          <button onClick={onBegin} className="begin-button">
            Begin
          </button>
          <button onClick={onClose} className="close-button">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default Instructions;
