/**
 * Editorial copy that is not tied to one project. Keep claims here modest and verifiable:
 * project-specific facts live in src/content/projects/*.md with their sources.
 */
export const copy = {
  hero: {
    sub: "I'm an Artificial Intelligence student who builds games and complete digital products: a Roblox simulation with a server-authoritative economy, and a trading-research system that ended in an honest negative result. Every figure comes with its source.",
  },
  who: {
    statement:
      "I'm an Artificial Intelligence student who builds games and complete digital products, and writes down, without spin, what works, what has been tested, and what isn't there yet.",
    interests: 'Software engineering · game systems · quantitative research · AI',
    way: 'AI-assisted and verification-first: nothing counts as done without evidence.',
  },
  method: {
    lede: 'A concept render is not a working game, and a passing simulation is not a profitable strategy. I write the difference down.',
    definitions: [
      { state: 'implemented', title: 'The code exists.', text: 'It compiles and runs. Nothing is claimed about whether it is correct.' },
      { state: 'tested', title: 'I kept the evidence.', text: 'A console log, a Studio capture, a test result, a report. Something a reviewer can open, with who ran it: automated tests, Claude Code in Studio, or me.' },
      { state: 'pending', title: 'Not yet validated.', text: 'Said out loud, with what is missing: a real device, real players, a real data store.' },
    ],
  },
  process: {
    lede: 'I work with AI tools such as Claude Code for programming, research, documentation and code review. I decide what gets built, supervise the work, and judge whether the result is good enough; each project says who ran which tests.',
    columns: [
      {
        key: 'human',
        title: 'Human decisions',
        text: 'Product definition, game mechanics, visual direction, which features to build, supervising the AI-assisted work, and the call on whether a result is good enough.',
      },
      {
        key: 'assisted',
        title: 'AI-assisted',
        text: 'Programming, research, documentation, code review and feature development, with Claude Code and other AI tools.',
      },
      {
        key: 'verified',
        title: 'Verified',
        text: 'Automated tests, play-throughs run by Claude Code in Studio, written reports and audits. Hand testing by me is only claimed where I have confirmed it. Every number comes from the repositories, with its source and date.',
      },
      {
        key: 'results',
        title: 'Results',
        text: 'Where something works, the evidence is there to open. Where the result was negative, the page says so.',
      },
      {
        key: 'pending',
        title: 'Still pending',
        text: 'Anything not validated yet is labelled Pending, with what is missing.',
      },
    ],
  },
  contact: {
    heading: 'Want to see how it works under the hood?',
    lede: 'The code of the game is private. The architecture, the tests and the decisions behind both projects are documented on their pages.',
  },
};
