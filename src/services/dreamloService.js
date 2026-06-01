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
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      console.error("submitScore API error:", res.status, data);
      return false;
    }
    console.log("submitScore success:", data);
    return true;
  } catch (error) {
    console.error("submitScore network error:", error);
    return false;
  }
};
