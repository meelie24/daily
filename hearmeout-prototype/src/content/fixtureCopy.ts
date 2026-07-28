import type { Badge, SavedItem, Skill, Subcategory } from "../types/product";

/**
 * Everything in this file is preview fixture data for the MF02 mechanic
 * evaluation. None of it is approved product content.
 */

export const publicLine = "To them, who are you?";

export const bridgeHero = {
  eyebrow: "Your Bridge",
  heading: publicLine,
  body: "See how you show up. Practice the skill. Use it in real life.",
  primary: "Continue practice",
};

export const insightRoute = {
  label: "From your Clarity result",
  heading: "When the room changes, your delivery may need to change too.",
  body: "This practice lets you work on timing, space and intensity without changing the words.",
  action: "Open the practice",
};

export const dailyRep = {
  title: "Daily Rep",
  name: "Responsive delivery",
  time: "About 3 minutes",
  action: "Start",
};

export const streak = {
  days: 4,
  label: "4-day practice streak",
  detail: "Practice on any skill keeps it going.",
};

export const weekSummary = {
  line: "3 practice days this week, 2 skills touched.",
  label: "Preview data",
};

export const skills: Skill[] = [
  {
    id: "communication",
    name: "Communication",
    accent: "#7357D5",
    accentSoft: "#EFEAFF",
    percent: 34,
  },
  {
    id: "conflict-repair",
    name: "Conflict & Repair",
    accent: "#C25E4A",
    accentSoft: "#FAEAE5",
    percent: 18,
  },
  {
    id: "connection-presence",
    name: "Connection & Presence",
    accent: "#0B8FA8",
    accentSoft: "#E4F7F6",
    percent: 52,
  },
  {
    id: "trust-consistency",
    name: "Trust & Consistency",
    accent: "#167A58",
    accentSoft: "#E4F3ED",
    percent: 41,
  },
  {
    id: "shared-life",
    name: "Shared Life & Responsibilities",
    accent: "#A2762A",
    accentSoft: "#F7EFDF",
    percent: 9,
  },
  {
    id: "emotional-awareness",
    name: "Emotional Awareness",
    accent: "#5B6ABF",
    accentSoft: "#EAEDF9",
    percent: 27,
  },
  {
    id: "appreciation-warmth",
    name: "Appreciation & Warmth",
    accent: "#C57800",
    accentSoft: "#F9EFDD",
    percent: 63,
  },
  {
    id: "closeness-consent",
    name: "Closeness & Consent",
    accent: "#A84D7F",
    accentSoft: "#F7E9F1",
    percent: 22,
  },
  {
    id: "boundaries-space",
    name: "Boundaries & Space",
    accent: "#3E7C6F",
    accentSoft: "#E7F1EE",
    percent: 15,
  },
];

export const overallPercent = 31;

export const communication = {
  title: "Communication",
  percent: 34,
  body: "Make the point easier to understand without losing yourself in the process.",
  subcategories: [
    { id: "feel-unheard", name: "When they feel unheard", playable: false },
    { id: "tone-delivery", name: "Tone & delivery", playable: true },
    { id: "keeping-it-in", name: "Keeping it in", playable: false },
    { id: "missing-context", name: "Missing context", playable: false },
    { id: "point-buried", name: "When the point gets buried", playable: false },
    {
      id: "unspoken-expectations",
      name: "Unspoken expectations",
      playable: false,
    },
    { id: "picking-the-moment", name: "Picking the moment", playable: false },
    { id: "texting-problems", name: "Texting problems", playable: false },
  ] satisfies Subcategory[],
  mechanicTag: "Mechanic test",
  notConnected:
    "Nothing to play here yet. This evaluation build only connects Tone & delivery.",
};

export const categoryShell = {
  heading: "No exercise is connected here",
  body: "This evaluation build only connects one practice, inside Communication. The rest of the skill map is preview data.",
  action: "Go to Communication",
};

/* Argument Style */

export type StyleTendency = "push" | "speed" | "quiet" | "watch";

export const argumentStyle = {
  introHeading: "What happens to your language under pressure?",
  introBody:
    "Three quick questions about what you notice in yourself when a conversation heats up. The result reflects today's answers. It isn't a diagnosis, and it isn't a permanent type.",
  introAction: "Start",
  questions: [
    {
      id: "q1",
      text: "When a disagreement starts moving fast, what do you usually notice first?",
      options: [
        {
          id: "q1-speed",
          text: "My voice gets ahead of me. I'm already answering before they finish.",
          tendency: "speed" as StyleTendency,
        },
        {
          id: "q1-push",
          text: "I get more blunt. The extra padding drops out of my sentences.",
          tendency: "push" as StyleTendency,
        },
        {
          id: "q1-quiet",
          text: "I start saying less. Shorter answers, longer pauses.",
          tendency: "quiet" as StyleTendency,
        },
        {
          id: "q1-watch",
          text: "I watch their face more than I listen to the words.",
          tendency: "watch" as StyleTendency,
        },
      ],
    },
    {
      id: "q2",
      text: "If someone says you misunderstood them, what is closest to your first reaction?",
      options: [
        {
          id: "q2-push",
          text: "I explain what I meant again, usually a little louder.",
          tendency: "push" as StyleTendency,
        },
        {
          id: "q2-speed",
          text: "I replay the conversation fast, looking for where it split.",
          tendency: "speed" as StyleTendency,
        },
        {
          id: "q2-quiet",
          text: "I drop it. It stops feeling worth the effort.",
          tendency: "quiet" as StyleTendency,
        },
        {
          id: "q2-watch",
          text: "I ask them to say it again so I can hear what I missed.",
          tendency: "watch" as StyleTendency,
        },
      ],
    },
    {
      id: "q3",
      text: "When you are under pressure, what changes most?",
      options: [
        {
          id: "q3-speed",
          text: "My pace. I stack points so nothing gets lost.",
          tendency: "speed" as StyleTendency,
        },
        {
          id: "q3-push",
          text: "My force. I land harder on the words that matter.",
          tendency: "push" as StyleTendency,
        },
        {
          id: "q3-quiet",
          text: "My volume. I get quieter and wait for it to pass.",
          tendency: "quiet" as StyleTendency,
        },
        {
          id: "q3-watch",
          text: "My attention. I track the other person more than my own point.",
          tendency: "watch" as StyleTendency,
        },
      ],
    },
  ],
  results: {
    push: {
      heading: "Under pressure, you press harder.",
      body: "Your words get more direct and your delivery gets heavier. The point gets through, but the timing usually suffers.",
    },
    speed: {
      heading: "Under pressure, you speed up.",
      body: "You answer faster and stack your points so nothing gets dropped. The other person can lose the thread because there's no pause between the pieces.",
    },
    quiet: {
      heading: "Under pressure, you go quiet.",
      body: "You shorten your answers and wait it out. That keeps things calm, but the thing you needed to say never gets said.",
    },
    watch: {
      heading: "Under pressure, you watch first.",
      body: "You track the other person before you commit to your own point. That usually reads as care. Sometimes you wait so long the moment passes.",
    },
  },
  resultNote:
    "This reflects today's answers, not a diagnosis or a permanent type. Ask again on a calmer day and it may change.",
  resultAction: "Practice responsive delivery",
  resultActionDetail: "Work on timing and intensity in a moving room.",
};

/* Clarity */

export const clarity = {
  heading: "Look at it from more than one angle",
  body: "Paste a message or describe a moment. You'll get one careful reading of it, kept on this device.",
  contexts: [
    "Coworker",
    "Manager",
    "Partner",
    "Friend",
    "Family",
    "Roommate",
    "Client",
    "Someone new",
  ],
  placeholder: "What did they say or do?",
  useExample: "Use an example",
  exampleText:
    "I sent the final client deck before my coworker reviewed the numbers. They said they need to see anything with their name on it before it goes out.",
  analyzeAction: "See the angles",
  privacyNote: "Nothing you type here is sent or stored.",
  result: {
    says: {
      label: "What it directly says",
      text: "They want to see anything that carries their name before it goes out.",
    },
    reading: {
      label: "One possible reading",
      text: "This could be about the numbers, not about you. Their name was on work they didn't get a chance to check.",
    },
    concern: {
      label: "One possible concern",
      text: "They may be worried it looks like they signed off on something they never saw.",
    },
    unclear: {
      label: "What's still unclear",
      text: "Whether this is about the one deck or a standing rule they want going forward.",
    },
    note: "This is one possible reading, not a verdict. Only they know what they meant.",
    customNote:
      "This evaluation build reads from a fixed sample, so the angles below come from the example, not your text.",
  },
  saveAction: "Save privately",
  savedConfirm: "Saved to Pocket. Your text stays on this device and was not stored.",
  practiceRoute: {
    label: "Work on the delivery side",
    heading: "Sometimes the message is fine and the timing is the problem.",
    action: "Practice responsive delivery",
  },
};

/* Pocket */

export const savedItems: SavedItem[] = [
  {
    id: "saved-clarity-deck",
    source: "Clarity",
    title: "The client deck that went early",
    body: "One reading: their name was on numbers they never got to check. Still unclear: one deck, or a standing rule.",
    savedOn: "Tue",
  },
  {
    id: "saved-style-speed",
    source: "Argument Style",
    title: "Under pressure, you speed up",
    body: "Your pace climbs and the points stack up. The other person needs a pause to follow.",
    savedOn: "Jul 14",
  },
  {
    id: "saved-mf02-rep",
    source: "Bridge",
    title: "Responsive delivery rep",
    body: "You waited out a crowded room, then came in firmer when the task needed an owner.",
    savedOn: "Jul 12",
  },
  {
    id: "saved-clarity-quiet",
    source: "Clarity",
    title: "The one-word reply",
    body: "A dry text is a missed camera angle, not the whole crime scene. What it directly said: they got the message.",
    savedOn: "Jul 9",
  },
];

export const badges: Badge[] = [
  {
    id: "badge-first-rep",
    name: "First real rep",
    detail: "You finished your first full practice.",
    earnedOn: "Jul 8",
  },
  {
    id: "badge-across-room",
    name: "Across the room",
    detail: "You changed your delivery to fit the moment three times in one week.",
    earnedOn: "Jul 12",
  },
  {
    id: "badge-four-days",
    name: "Four days",
    detail: "Four practice days in a row.",
    earnedOn: "Jul 15",
  },
  {
    id: "badge-still-growing",
    name: "Still growing",
    detail: "You came back after a week away.",
    earnedOn: "Jul 21",
  },
];

export const pocketCopy = {
  privateLabel: "Only you can see this",
  growthHeading: "Growth Tree",
  growthBody:
    "Each branch is a skill. Leaves fill in as you practice. History stays even when new skills are added.",
  badgesBody: "Badges are permanent and private. Nobody is ranked here.",
  searchPlaceholder: "Search saved items",
  emptySearch: "Nothing saved matches that.",
};

/* Settings */

export const settingsCopy = {
  title: "Settings",
  toggles: {
    sound: {
      label: "Sound",
      detail: "Room tone and quiet cues during practice.",
    },
    haptics: {
      label: "Haptics",
      detail: "A small tap when you send a turn, where your device supports it.",
    },
    controlledPace: {
      label: "Controlled pace",
      detail: "The room waits for you between events. Judgment stays the same.",
    },
    reduceMotion: {
      label: "Reduce motion",
      detail: "Replaces travel with clear state changes.",
    },
    dailyReminder: {
      label: "Daily Rep reminder",
      detail: "A nudge once a day. Off by default in this preview.",
    },
  },
  panels: {
    privacy: {
      title: "Privacy and saved data",
      body: [
        "Everything in this preview lives on this device. Nothing is sent anywhere.",
        "Clarity never stores what you type. Saved items keep only the reading, never your original text.",
        "There's no account here, so there's nothing to delete on a server. Clearing your browser data removes all of it.",
      ],
    },
    identity: {
      title: "Identity and fictional cast",
      body: "All of this is optional and editable, and you can skip every part. It shapes how people show up in practice scenes. It never changes the difficulty or what counts as skill.",
      pronouns: ["They/them", "She/her", "He/him", "She/they", "He/they", "Ask me"],
      genders: ["Woman", "Man", "Non-binary", "Self-described"],
      orientations: ["Straight", "Gay", "Lesbian", "Bi or pan", "Queer", "Ace", "Self-described"],
      cast: ["Mix it up", "More like me", "Doesn't matter"],
      skip: "Skip",
    },
    safety: {
      title: "Safety and support",
      body: [
        "HearMeOut is practice. It isn't therapy, mediation, diagnosis or crisis care.",
        "If something heavy is happening in your life right now, a real person is the right place to take it.",
        "In the US, you can call or text 988 to reach the Suicide & Crisis Lifeline, any hour.",
        "If someone is hurting you, that is not a communication problem for you to fix. The Domestic Violence Hotline is 1-800-799-7233.",
      ],
    },
  },
  resetInstructions: {
    label: "Show the practice instructions again",
    detail: "The next practice will start with the how-to screen.",
    done: "Done. You'll see the instructions next time.",
  },
  evaluationNote: "Evaluation build. Preferences stay on this device.",
};

/* Guide */

export const guide = {
  name: "The Guide",
  bridgeLine: "He follows your practice and speaks up when he has something useful to say.",
  resultLine: "You noticed the room change and adjusted without being told. That's the skill.",
};
