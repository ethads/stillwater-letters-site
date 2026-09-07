/* ============================================================
   THE STILLWATER LETTERS — This Week (the site's heartbeat)
   ============================================================
   This ONE file feeds the "This Week in Stillwater" tiles on the
   homepage, the /this-week/ page, and the "From the circle" block
   on the current letter's page.

   HOW TO UPDATE (each Tuesday, ~2 minutes):
   1. Point `letter` at the letter that went out this morning.
   2. Set `weekOf` to today's date.
   3. Paste Alice's reflection prompt for the week into `prompt`
      (her words only — usually the letter's faith action).
   4. Add any reflections women have shared — FIRST NAME ONLY,
      and ONLY with their explicit permission.
   5. Set `prayer.carried` to the real number of requests carried
      this week (0 is fine — the site shows a gentle line instead).
   6. If a prayer was answered and the woman has given her blessing
      to share it, fill `answered`. Otherwise leave it null.

   HOUSE RULES (never break these):
   — Nothing invented. Every name, number and quote must be real.
   — Nothing shared without the woman's explicit permission.
   — First names only. Never surnames, suburbs, or identifying detail.
   — When in doubt, leave it out. A quiet week shown honestly is
     better than a busy week that isn't true.
   ============================================================ */

window.STILLWATER_WEEK = {

  weekOf: "11 August 2026",

  letter: {
    number: "09",
    slug: "to-hope-in-god-is-to-soar",
    title: "To Hope in God, is to Soar",
    verse: "But those who wait upon the Lord shall renew their strength; they shall mount up with wings as eagles, they shall run and not grow weary, they shall walk and not grow faint.",
    verseRef: "Isaiah 40:31",
    excerpt: "Hope in God gives me confidence that He is working, even when I don't see it. This hope is real, and can never be broken because it is firmly anchored in God's promises."
  },

  /* Alice's reflection prompt for the week (her words). */
  prompt: "Write down three promises from God's word that give you hope, and revisit them when you start to feel discouraged.",

  /* Real, permissioned reflections from readers. First names only.
     Example: { name: "Karen", text: "This letter met me on a hard morning." } */
  reflections: [
    { name: "Callista", text: "There always seems to be something in her words, the Scripture or the journaling prompts that speaks to where I am and brings me back to God's Word." }
  ],

  prayer: {
    carried: 0,   /* real number of requests being carried this week */
    note: ""      /* optional, e.g. "Each one is being prayed for by name." */
  },

  /* Only with her explicit blessing. Example:
     { text: "After months of waiting, the scan came back clear.", name: "J." } */
  answered: null,

  /* Optional one-line welcome when new women join, e.g.
     "Two new women joined the circle this week — welcome."
     COUNTS ONLY — never name new subscribers. Joining the letters
     is private; a woman's presence here is hers to mention, not ours. */
  welcome: ""
};