export const fetchHighScores = async () => {
  try {
    const res = await fetch("/api/scores");
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
};

export const submitScore = async (name, score) => {
  try {
    await fetch("/api/scores", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, score }),
    });
  } catch (error) {
    console.error("Error submitting score:", error);
  }
};
