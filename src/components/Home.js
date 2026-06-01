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
        const filteredCategories = data.trivia_categories.filter((category) =>
          desiredCategories.includes(category.name)
        );
        setCategories(filteredCategories);
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
      const countdown = setInterval(() => {
        setPreGameTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(countdown);
    } else if (preGameStarted && preGameTimer === 0) {
      setPreGameStarted(false);
      setGameStarted(true);
    }
  }, [preGameStarted, preGameTimer]);

  useEffect(() => {
    if (gameStarted && timer > 0) {
      const countdown = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(countdown);
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
        setFetchError("Too many requests. Please wait a moment and try again.");
        setTimeout(() => setFetchError(null), 3000);
        return;
      }

      const data = await response.json();

      if (data.results.length === 0) {
        setFetchError("No questions available. Please try a different category.");
        return;
      }

      const question = data.results[0];
      setCurrentQuestion({
        text: he.decode(question.question),
        options: [
          ...question.incorrect_answers.map((a) => he.decode(a)),
          he.decode(question.correct_answer),
        ].sort(() => Math.random() - 0.5),
        correctAnswer: he.decode(question.correct_answer),
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
    if (isCorrect) {
      setScore((prev) => prev + 1);
    }
    setIsModalOpen(false);
    setCurrentQuestion(null);
  };

  const handleSkip = async () => {
    setIsModalOpen(false);
    setCurrentQuestion(null);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    await fetchQuestion(selectedCategory);
  };

  const handleStartGame = () => {
    setIsInstructionsOpen(true);
  };

  const handleBeginGame = () => {
    setIsInstructionsOpen(false);
    setScore(0);
    setTimer(60);
    setPreGameTimer(3);
    setPreGameStarted(true);
  };

  const handleCloseInstructions = () => {
    setIsInstructionsOpen(false);
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

  return (
    <div className="page home">
      {fetchError && <p>{fetchError}</p>}
      <div className="score-container">
        <h2>Your Score: {score}</h2>
        <h2>
          {gameStarted
            ? `Time Remaining: ${timer}s`
            : preGameStarted
            ? `Starting in: ${preGameTimer}`
            : ""}
        </h2>
      </div>
      <div
        className={`start-button-container ${
          gameStarted || preGameStarted ? "small" : ""
        }`}
      >
        {!gameStarted && !preGameStarted && (
          <button onClick={handleStartGame} className="start-game-button">
            Start Game
          </button>
        )}
      </div>
      {highScores.length > 0 && (
        <div className="highScore">
          <div className="highScore-container">
            {highScores.map((hs, i) => (
              <HighScoreCard key={i} highScore={hs} />
            ))}
          </div>
        </div>
      )}
      <Categories
        categories={categories}
        onSelectCategory={handleSelectCategory}
      />
      <QuestionModal
        question={currentQuestion}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSkip={handleSkip}
      />
      <Instructions
        isOpen={isInstructionsOpen}
        onClose={handleCloseInstructions}
        onBegin={handleBeginGame}
      />

      {namePromptOpen && (
        <div className="name-prompt-overlay">
          <div className="name-prompt">
            <h2>Time's Up!</h2>
            <p className="final-score-text">Your score: {finalScore}</p>
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
