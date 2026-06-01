export default function handler(req, res) {
  res.status(200).json({
    configured: !!(process.env.DREAMLO_PUBLIC_KEY && process.env.DREAMLO_PRIVATE_KEY),
    hasPublicKey: !!process.env.DREAMLO_PUBLIC_KEY,
    hasPrivateKey: !!process.env.DREAMLO_PRIVATE_KEY,
    node: process.version,
    time: new Date().toISOString(),
  });
}
