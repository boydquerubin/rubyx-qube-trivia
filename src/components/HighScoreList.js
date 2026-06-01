import React, { useEffect, useState } from "react";
import { fetchHighScores } from "../services/supaBaseAuthService";
import HighScoreCard from "./HighScoreCard";

const HighScoreList = () => {
  const [highScores, setHighScores] = useState([]);

  // Fetch high scores when the component loads
  useEffect(() => {
    const getHighScores = async () => {
      const scores = await fetchHighScores(); // Fetch high scores from the backend
      setHighScores(scores); // Update state with fetched scores
    };

    getHighScores();
  }, []); // Empty dependency array ensures it runs once

  return (
    <div>
      <h2>High Scores</h2>
      {highScores.length > 0 ? (
        highScores.map((highScore, index) => (
          <HighScoreCard key={index} highScore={highScore} />
        ))
      ) : (
        <p>No high scores available yet!</p>
      )}
    </div>
  );
};

export default HighScoreList;
