app.get("/test-food", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM food LIMIT 1");
    res.json(rows);
  } catch (err) {
    console.error("Error al consultar food:", err);
    res.status(500).json({ error: "Error al consultar food" });
  }
});
