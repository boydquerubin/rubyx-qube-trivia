export default async function handler(req, res) {
  const privateKey = process.env.DREAMLO_PRIVATE_KEY;
  const publicKey = process.env.DREAMLO_PUBLIC_KEY;

  if (!publicKey || !privateKey) {
    console.error("Dreamlo: DREAMLO_PUBLIC_KEY / DREAMLO_PRIVATE_KEY env vars are not set");
    return res.status(503).json({ error: "Leaderboard not configured" });
  }

  try {
    if (req.method === "GET") {
      const response = await fetch(`http://dreamlo.com/lb/${publicKey}/json`);
      const data = await response.json();
      const raw = data.dreamlo?.leaderboard?.entry ?? [];
      const entries = Array.isArray(raw) ? raw : [raw];
      const scores = entries
        .filter((e) => e && e.name)
        .map((e) => ({ username: e.name, score: Number(e.score) }));
      return res.status(200).json(scores);
    }

    if (req.method === "POST") {
      const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body ?? {};
      const { name, score } = body;

      if (score == null) {
        return res.status(400).json({ error: "score is required" });
      }

      const safeName = encodeURIComponent((name || "Anonymous").trim().slice(0, 20));
      const dreamloRes = await fetch(
        `http://dreamlo.com/lb/${privateKey}/add/${safeName}/${Number(score)}`
      );
      const text = await dreamloRes.text();
      console.log("Dreamlo add response:", text, "status:", dreamloRes.status);

      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("Dreamlo API error:", error.message);
    return res.status(500).json({ error: error.message });
  }
}
