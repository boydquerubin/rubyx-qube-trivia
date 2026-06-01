import { useEffect, useState, useCallback } from "react";
import HighScoreCard from "./HighScoreCard";
import Categories from "./Categories";
import QuestionModal from "./QuestionModal";
import Instructions from "./Instructions"; // Import the Instructions component
import { supabase } from "../supabaseClient";
import { storeScore } from "../services/supaBaseScoreService";
import { recordHighScore } from "../services/supaBaseAuthService";
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

const Home = ({ user }) => {
  const [fetchError, setFetchError] = useState(null);
  const [highScores, setHighScores] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInstructionsOpen, setIsInstructionsOpen] = useState(false); // New state for instructions modal
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(60);
  const [preGameTimer, setPreGameTimer] = useState(3);
  const [gameStarted, setGameStarted] = useState(false);
  const [preGameStarted, setPreGameStarted] = useState(false);

  const handleGameOver = useCallback(async () => {
    if (user && score > 0) {
      const result = await recordHighScore(user.id, score);
      if (result?.success) {
        console.log("High score recorded successfully");
        // Re-fetch the high scores to update the state
        const { data: updatedHighScores, error } = await supabase
          .from("highScore")
          .select("*")
          .order("score", { ascending: false });

        if (error) {
          console.error("Error fetching updated high scores:", error.message);
        } else {
          setHighScores(updatedHighScores); // Update the state with the new high scores
        }
      } else {
        console.error("Failed to record high score");
      }
    }
  }, [user, score]);

  // Fetch high scores on component mount
  useEffect(() => {
    const fetchHighScores = async () => {
      const { data, error } = await supabase
        .from("highScore")
        .select("*")
        .order("score", { ascending: false });

      if (error) {
        console.error("Error fetching high scores:", error.message);
      } else {
        setHighScores(data);
      }
    };

    fetchHighScores();
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
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

    fetchCategories();
  }, []);

  useEffect(() => {
    if (preGameStarted && preGameTimer > 0) {
      const countdown = setInterval(() => {
        setPreGameTimer((prevTimer) => prevTimer - 1);
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
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
      return () => clearInterval(countdown);
    } else if (gameStarted && timer === 0) {
      alert("Time's up! Your final score is " + score);
      handleGameOver();
      setGameStarted(false);
      setIsModalOpen(false);
    }
  }, [gameStarted, timer, handleGameOver, score]);

  const handleSelectCategory = async (category) => {
    setSelectedCategory(category);
    await fetchQuestion(category);
  };

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
        setFetchError(
          "No questions available. Please try a different category."
        );
        return;
      }

      const question = data.results[0];
      setCurrentQuestion({
        text: he.decode(question.question),
        options: [
          ...question.incorrect_answers.map((answer) => he.decode(answer)),
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

  const handleCloseModal = async (isCorrect) => {
    if (isCorrect) {
      setScore((prevScore) => prevScore + 1);
    }

    setIsModalOpen(false);
    setCurrentQuestion(null);
  };

  useEffect(() => {
    if (user && score > 0) {
      const storeUserScore = async () => {
        try {
          await storeScore(user.id, score);
        } catch (error) {
          console.error("Error storing score:", error);
        }
      };
      storeUserScore();
    }
  }, [score, user]);

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const handleSkip = async () => {
    setIsModalOpen(false);
    setCurrentQuestion(null);
    await delay(2000);
    await fetchQuestion(selectedCategory);
  };

  const handleStartGame = () => {
    setIsInstructionsOpen(true); // Open the instructions modal
  };

  const handleBeginGame = () => {
    setIsInstructionsOpen(false); // Close instructions modal
    setScore(0);
    setTimer(60);
    setPreGameTimer(3);
    setPreGameStarted(true);
  };

  const handleCloseInstructions = () => {
    setIsInstructionsOpen(false); // Close the instructions modal without starting the game
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
            {highScores.map((newHighScore) => (
              <HighScoreCard key={newHighScore.id} highScore={newHighScore} />
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
        onClose={(isCorrect) => handleCloseModal(isCorrect)}
        onSkip={handleSkip}
      />
      <Instructions
        isOpen={isInstructionsOpen}
        onClose={handleCloseInstructions}
        onBegin={handleBeginGame}
      />
    </div>
  );
};

export default Home;
