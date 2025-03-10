const express = require("express");
const router = express.Router();
const { getRankings, getScrapeStatus } = require("../services/rankingsService");
const { scrapeAndSaveGenre } = require("../services/scraperService");

router.get("/scrape-status", (req, res) => {
    const genreCode = req.query.genre || "DM0000";
    res.json({ scraping: getScrapeStatus(genreCode) });
});

// ✅ Fetch Rankings (Checks Cache, Scrapes if Needed)
router.get("/rankings", async (req, res) => {
    try {
        const genreCode = req.query.genre || "DM0000";
        let rankings = await getRankings(genreCode);

        if (!rankings.length) {
            console.log(`🔄 Scraping initiated for genre: ${genreCode}`);
            await scrapeAndSaveGenre(genreCode);
            rankings = await getRankings(genreCode); // Fetch updated rankings after scraping
        }

        res.json(rankings);
    } catch (error) {
        console.error("❌ Error fetching rankings:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
