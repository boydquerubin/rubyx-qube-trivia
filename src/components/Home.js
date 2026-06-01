import { useEffect, useState, useCallback } from "react";
import HighScoreCard from "./HighScoreCard";
import Categories from "./Categories";
import QuestionModal from "./QuestionModal";
import Instructions from "./Instructions";
import { fetchHighScores, submitScore } from "../services/dreamloService";
import he from "he";
import "../index.css";

const desiredCategories = [
  "General Knowledge",
  "Science & Nature",
  "Sports",
  "Entertainment: Books",
  "Entertainment: Film",
  "Entertainment: Music",
  "Geography",
  "History",
  "Art",
];

const Home = () => {
  const [fetchError, setFetchError] = useState(null);
  const [highScores, setHighScores] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInstructionsOpen, setIsInstructionsOpen] = useState(false);
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(60);
  const [preGameTimer, setPreGameTimer] = useState(3);
  const [gameStarted, setGameStarted] = useState(false);
  const [preGameStarted, setPreGameStarted] = useState(false);
  const [namePromptOpen, setNamePromptOpen] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [finalScore, setFinalScore] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const loadHighScores = useCallback(async () => {
    const scores = await fetchHighScores();
    setHighScores(scores);
  }, []);

  useEffect(() => {
    loadHighScores();
  }, [loadHighScores]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await fetch("https://opentdb.com/api_category.php");
        if (!response.ok) throw new Error("Network response was not ok");
        const data = await response.json();
        const filtered = data.trivia_categories.filter((c) =>
          desiredCategories.includes(c.name)
        );
        setCategories(filtered);
      } catch (error) {
        setFetchError("Could not fetch categories");
        console.error(error);
      }
    };
    loadCategories();
  }, []);

  const handleGameOver = useCallback(() => {
    setGameStarted(false);
    setIsModalOpen(false);
    setFinalScore(score);
    if (score > 0) {
      setNamePromptOpen(true);
    }
  }, [score]);

  useEffect(() => {
    if (preGameStarted && preGameTimer > 0) {
      const id = setInterval(() => setPreGameTimer((p) => p - 1), 1000);
      return () => clearInterval(id);
    } else if (preGameStarted && preGameTimer === 0) {
      setPreGameStarted(false);
      setGameStarted(true);
    }
  }, [preGameStarted, preGameTimer]);

  useEffect(() => {
    if (gameStarted && timer > 0) {
      const id = setInterval(() => setTimer((p) => p - 1), 1000);
      return () => clearInterval(id);
    } else if (gameStarted && timer === 0) {
      handleGameOver();
    }
  }, [gameStarted, timer, handleGameOver]);

  const fetchQuestion = async (category) => {
    try {
      const response = await fetch(
        `https://opentdb.com/api.php?amount=1&category=${category.id}&type=multiple`
      );
      if (response.status === 429) {
        setFetchError("Too many requests — wait a moment and try again.");
        setTimeout(() => setFetchError(null), 3000);
        return;
      }
      const data = await response.json();
      if (data.results.length === 0) {
        setFetchError("No questions available. Try a different category.");
        return;
      }
      const q = data.results[0];
      setCurrentQuestion({
        text: he.decode(q.question),
        options: [
          ...q.incorrect_answers.map((a) => he.decode(a)),
          he.decode(q.correct_answer),
        ].sort(() => Math.random() - 0.5),
        correctAnswer: he.decode(q.correct_answer),
      });
      setIsModalOpen(true);
    } catch (error) {
      setFetchError("Could not fetch the question");
      console.error(error);
    }
  };

  const handleSelectCategory = async (category) => {
    setSelectedCategory(category);
    await fetchQuestion(category);
  };

  const handleCloseModal = (isCorrect) => {
    if (isCorrect) setScore((p) => p + 1);
    setIsModalOpen(false);
    setCurrentQuestion(null);
  };

  const handleSkip = async () => {
    setIsModalOpen(false);
    setCurrentQuestion(null);
    await new Promise((r) => setTimeout(r, 2000));
    await fetchQuestion(selectedCategory);
  };

  const handleStartGame = () => setIsInstructionsOpen(true);

  const handleBeginGame = () => {
    setIsInstructionsOpen(false);
    setScore(0);
    setTimer(60);
    setPreGameTimer(3);
    setPreGameStarted(true);
  };

  const handleSubmitScore = async () => {
    const name = playerName.trim() || "Anonymous";
    setSubmitting(true);
    await submitScore(name, finalScore);
    await loadHighScores();
    setSubmitting(false);
    setNamePromptOpen(false);
    setPlayerName("");
  };

  const handleSkipScore = () => {
    setNamePromptOpen(false);
    setPlayerName("");
  };

  const timerDisplay = gameStarted ? timer : preGameStarted ? preGameTimer : "--";

  return (
    <div className="page home">
      {fetchError && <p className="fetch-error">{fetchError}</p>}

      <div className="game-layout">
        {/* ── Leaderboard sidebar ── */}
        <aside className="leaderboard-panel">
          <div className="leaderboard-header">
            <h2>HIGH SCORES</h2>
          </div>
          <div className="leaderboard-list">
            {highScores.length > 0 ? (
              highScores.slice(0, 10).map((hs, i) => (
                <HighScoreCard key={i} highScore={hs} rank={i + 1} />
              ))
            ) : (
              <>
                <p className="no-scores">No scores yet!</p>
                <p className="no-scores-sub">Be the first!</p>
              </>
            )}
          </div>
        </aside>

        {/* ── Game area ── */}
        <div className="game-area">
          <div className="hud">
            <div className="hud-block">
              <span className="hud-label">SCORE</span>
              <span className="hud-value">{score}</span>
            </div>
            <div className="hud-block">
              <span className="hud-label">TIME</span>
              <span
                className={`hud-value${
                  gameStarted && timer <= 10 ? " hud-urgent" : ""
                }`}
              >
                {timerDisplay}
              </span>
            </div>
          </div>

          {!gameStarted && !preGameStarted && (
            <div className="start-area">
              <button onClick={handleStartGame} className="start-game-button">
                START GAME
              </button>
            </div>
          )}

          <Categories
            categories={categories}
            onSelectCategory={handleSelectCategory}
          />
        </div>
      </div>

      <QuestionModal
        question={currentQuestion}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSkip={handleSkip}
      />
      <Instructions
        isOpen={isInstructionsOpen}
        onClose={() => setIsInstructionsOpen(false)}
        onBegin={handleBeginGame}
      />

      {namePromptOpen && (
        <div className="name-prompt-overlay">
          <div className="name-prompt">
            <h2>TIME'S UP!</h2>
            <p className="final-score-text">SCORE: {finalScore}</p>
            <p>Enter your name for the leaderboard</p>
            <input
              type="text"
              placeholder="Your name"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              maxLength={20}
              onKeyDown={(e) => e.key === "Enter" && handleSubmitScore()}
              autoFocus
            />
            <div className="name-prompt-buttons">
              <button onClick={handleSubmitScore} disabled={submitting}>
                {submitting ? "Saving..." : "Submit"}
              </button>
              <button onClick={handleSkipScore} className="skip-button">
                Skip
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
