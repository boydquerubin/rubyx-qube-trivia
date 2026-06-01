export default async function handler(req, res) {
  const privateKey = process.env.DREAMLO_PRIVATE_KEY;
  const publicKey = process.env.DREAMLO_PUBLIC_KEY;

  if (!publicKey || !privateKey) {
    return res.status(200).json([]);
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
      res.status(200).json(scores);
    } else if (req.method === "POST") {
      const { name, score } = req.body;
      const safeName = encodeURIComponent((name || "Anonymous").trim().slice(0, 20));
      await fetch(`http://dreamlo.com/lb/${privateKey}/add/${safeName}/${score}`);
      res.status(200).json({ success: true });
    } else {
      res.status(405).json({ error: "Method not allowed" });
    }
  } catch (error) {
    console.error("Dreamlo API error:", error);
    res.status(200).json([]);
  }
}
