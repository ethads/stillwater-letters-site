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

  weekOf: "20 October 2026",

  letter: {
    number: "19",
    slug: "fight-like-heaven-be-battle-ready",
    title: "Fight Like Heaven — Be Battle Ready",
    verse: "13 Therefore put on the full armor of God, so that when the day of evil comes, you may be able to stand your ground, and after you have done everything, to stand. 14 Stand firm then, with the belt of truth buckled around your waist, with the breastplate of righteousness in place, 15 and with your feet fitted with the readiness that comes from the gospel of peace. 16 In addition to all this, take up the shield of faith, with which you can extinguish all the flaming arrows of the evil one. 17 Take the helmet of salvation and the sword of the Spirit, which is the word of God. 18 And pray in the Spirit on all occasions with all kinds of prayers and requests. With this in mind, be alert and always keep on praying for all the Lord's people.",
    verseRef: "Ephesians 6:13–18 (NIV)",
    excerpt: "In order to fight like heaven, we must be battle ready. This means to be prepared spiritually before the battle begins."
  },

  /* Alice's reflection prompt for the week (her words). */
  prompt: "This week in your journal, take the time to write a prayer. Ask God to prepare your heart, strengthen your faith, and help you stand firm in Truth.",

  /* Real, permissioned reflections from readers. First names only.
     Example: { name: "Karen", text: "This letter met me on a hard morning." } */
  /* Deliberately empty — do not "restore" past reflections here.
     community.js attaches reflections to the CURRENT letter's "From the
     circle" card (gated by data-sw-slug), so a general testimonial placed
     here renders on the current letter page as if it were written about
     that specific letter. Callista's testimonial is a general one about the
     letters (published 2026-08-24, her words remain in git history); it is
     held to the honest quiet-state until a letter-specific, re-permissioned
     reflection is in hand. A per-reflection `slug` model would let general
     testimonials persist on ungated pages safely — see growth plan. */
  reflections: [],

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