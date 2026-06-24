/* Projects shown on fun.html — edit freely.
   Plain global array (no modules), loaded via <script src="projects.js"></script>.
   problem / process / solution accept simple text: blank lines separate paragraphs,
   and lines starting with "- " become bullet lists. */
const PROJECTS = [
  {
    id: "cleanplate",
    title: "CleanPlate",
    thumb: "assets/projects/cleanplate-thumb.jpg",
    preview: "assets/projects/cleanplate-preview.jpg",
    problem: `[placeholder — Tom to refine] Most people have no easy way to see the carbon impact of what they eat, so sustainability rarely factors into everyday food choices.`,
    process: `[placeholder — Tom to refine] Co-founded a not-for-profit and took a carbon-labelling food app from blank page to launch — discovery, weekly Figma iteration, user testing, grant funding and shipping to production.`,
    solution: `[placeholder — Tom to refine] A live app that surfaces the carbon footprint of meals, built to make sustainable eating a passive, low-effort habit.`,
    cta: { label: "View the CleanPlate site", url: "[TODO: Tom to paste the hosted CleanPlate link]" }
  },
  {
    id: "worldcup",
    title: "World Cup Sweepstake",
    thumb: "assets/projects/worldcup-thumb.jpg",
    preview: "assets/projects/worldcup-preview.jpg",
    problem: `[placeholder — Tom to refine] Office and friend-group sweepstakes are usually run on paper or messy spreadsheets — fiddly to set up, easy to lose track of.`,
    process: `[placeholder — Tom to refine] Designed and built a web app that runs a World Cup sweepstake end to end, with shareable per-group instances.`,
    solution: `[placeholder — Tom to refine] A live, hosted tool people can spin up and share in seconds.`,
    cta: { label: "Open the live site", url: "https://worldcupsweepstake.vercel.app/s/example" }
  },
  {
    id: "catanbot",
    title: "Catan Bot",
    thumb: "assets/projects/catanbot-thumb.jpg",
    preview: "assets/projects/catanbot-preview.jpg",
    problem: `[placeholder — Tom to refine] Catan needs three or more players, but you don't always have enough people in the room.`,
    process: `[placeholder — Tom to refine] Built a virtual Catan opponent you interact with during a real "on the road" game at home — effectively a digital third player.`,
    solution: `[placeholder — Tom to refine] A bot that lets a smaller group play a full game.`,
    cta: null
  },
  {
    id: "pocketpoker",
    title: "Pocket Poker",
    thumb: "assets/projects/pocketpoker-thumb.jpg",
    preview: "assets/projects/pocketpoker-preview.jpg",
    problem: `[placeholder — Tom to refine] A normal poker set is bulky to carry around for a casual game.`,
    process: `[placeholder — Tom to refine] Designed the brand and produced a trial run of a miniaturised poker set made of small printed cards.`,
    solution: `[placeholder — Tom to refine] A pocket-sized physical trial — printed cards and brand identity.`,
    cta: null
  }
];
