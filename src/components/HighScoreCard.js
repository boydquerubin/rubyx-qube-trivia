import React from "react";
import PropTypes from "prop-types";
import "./HighScoreCard.css";

const rankColor = (rank) => {
  if (rank === 1) return "gold";
  if (rank === 2) return "silver";
  if (rank === 3) return "bronze";
  return "default";
};

const HighScoreCard = ({ highScore, rank }) => {
  return (
    <div className={`hs-row hs-rank-${rankColor(rank)}`}>
      <span className="hs-rank">{rank}</span>
      <span className="hs-name">{highScore.username}</span>
      <span className="hs-score">{highScore.score}</span>
    </div>
  );
};

HighScoreCard.propTypes = {
  highScore: PropTypes.shape({
    username: PropTypes.string.isRequired,
    score: PropTypes.number.isRequired,
  }).isRequired,
  rank: PropTypes.number.isRequired,
};

export default HighScoreCard;
