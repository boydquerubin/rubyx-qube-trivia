export const config = {
  api: { bodyParser: { sizeLimit: "1mb" } },
};

async function readBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  return new Promise((resolve) => {
    let raw = "";
    req.on("data", (chunk) => { raw += chunk; });
    req.on("end", () => {
      try { resolve(JSON.parse(raw)); }
      catch { resolve({}); }
    });
    req.on("error", () => resolve({}));
  });
}

export default async function handler(req, res) {
  const privateKey = process.env.DREAMLO_PRIVATE_KEY;
  const publicKey  = process.env.DREAMLO_PUBLIC_KEY;

  if (!publicKey || !privateKey) {
    console.error("Dreamlo: env vars not set on this deployment");
    return res.status(503).json({ error: "Leaderboard not configured — env vars missing" });
  }

  try {
    if (req.method === "GET") {
      const response = await fetch(`http://dreamlo.com/lb/${publicKey}/json`);
      if (!response.ok) {
        console.error("Dreamlo GET failed:", response.status);
        return res.status(200).json([]);
      }
      const data = await response.json();
      const raw = data.dreamlo?.leaderboard?.entry ?? [];
      const entries = Array.isArray(raw) ? raw : [raw];
      const scores = entries
        .filter((e) => e && e.name)
        .map((e) => ({ username: e.name, score: Number(e.score) }));
      return res.status(200).json(scores);
    }

    if (req.method === "POST") {
      const body = await readBody(req);
      const { name, score } = body;

      console.log("POST /api/scores body:", { name, score });

      if (score == null) {
        return res.status(400).json({ error: "score is required", received: body });
      }

      const safeName = encodeURIComponent((name || "Anonymous").trim().slice(0, 20));
      const url = `http://dreamlo.com/lb/${privateKey}/add/${safeName}/${Number(score)}`;
      console.log("Calling Dreamlo:", url.replace(privateKey, "***"));

      const dreamloRes = await fetch(url);
      const text = await dreamloRes.text();
      console.log("Dreamlo response:", dreamloRes.status, text);

      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("Dreamlo API error:", error.message);
    return res.status(500).json({ error: error.message });
  }
}
