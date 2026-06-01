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
    const res = await fetch("/api/scores", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, score }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error("submitScore failed:", res.status, err);
      return false;
    }
    return true;
  } catch (error) {
    console.error("submitScore error:", error);
    return false;
  }
};
