import type { CompanyId, ProjectId } from "./domain";

export type RosterEntry = {
  id: string;
  name: string;
  handle: string;
  role: string;
  /** Chronological. The last one is the current public affiliation. */
  companies: readonly CompanyId[];
  /** What they build, with a mark. Not chronological. */
  projects: readonly ProjectId[];
};

function entry(
  id: string,
  name: string,
  handle: string,
  role: string,
  companies: readonly CompanyId[],
  projects: readonly ProjectId[] = [],
): RosterEntry {
  return { id, name, handle, role, companies, projects };
}

/**
 * Editorial order. Affiliations are best-effort public record as of 2026-10-02.
 * A company with no lockup in `public/logos/` shows its name, never a made-up mark.
 */
export const roster: readonly RosterEntry[] = [
  entry("addy", "Addy Osmani", "addyosmani", "Claude Code", ["google", "anthropic"]),
  entry("theo", "Theo", "theo", "Founder", ["twitch", "t3"]),
  entry("prime", "The Primeagen", "ThePrimeagen", "In public", ["netflix"]),
  entry("teej", "Teej", "teej_dv", "Teacher", ["epic", "sourcegraph", "bootdev"], ["neovim", "terminal"]),
  entry("lydia", "Lydia Hallie", "lydiahallie", "Claude Code", ["vercel", "bun", "anthropic"]),
  entry("jamie", "Jamie Turner", "jamwt", "Co-founder", ["bump", "dropbox", "convex"]),
  entry("maria", "Maria", "maria_rcks", "At T3", ["t3"]),
  entry("micky", "Micky", "Rasmic", "Scout", ["a16z", "convex"]),
  entry("guillermo", "Guillermo Rauch", "rauchg", "Founder", ["vercel"], ["nextjs"]),
  entry("sunil", "Sunil Pai", "threepointone", "Builder in residence", ["partykit", "cloudflare"]),
  entry("melkey", "Melkey", "MelkeyDev", "Engineer", ["twitch", "vercel"]),
  entry("kit", "Kit Langton", "kitlangton", "OpenCode", ["anomaly"], ["opencode", "effect"]),
  entry("ryan", "Ryan Vogel", "ryanvogel", "OpenCode", ["neon", "databricks", "anomaly"], ["opencode"]),
  entry("michael", "Michael Reeves", "michaelreeves", "In public", ["youtube"]),
  entry("pewdiepie", "PewDiePie", "pewdiepie", "In public", ["youtube"]),
  entry("dax", "Dax", "thdxr", "OpenCode", ["sst", "anomaly"], ["opencode"]),
  entry("ethan", "Ethan Niser", "ethanniser", "On his own", ["vercel"]),
  entry("evan", "Evan Bacon", "Baconbrix", "SpaceXAI", ["expo", "spacex"]),
  entry("rhys", "Rhys Sullivan", "RhysSullivan", "Founder", ["vercel", "ycombinator"]),

  entry("poteto", "Lauren Tan", "poteto", "SpaceXAI", ["netflix", "meta", "cursor", "spacex"], ["react"]),
  entry("matt", "Matt Pocock", "mattpocockuk", "Teacher", ["vercel", "aihero"], ["typescript"]),
  entry("laurie", "Laurie Wired", "lauriewired", "Researcher", ["microsoft", "google"]),
  entry("elon", "Elon Musk", "elonmusk", "Founder", ["paypal", "tesla", "spacex", "x", "xai"]),
  entry("dario", "Dario Amodei", "DarioAmodei", "Co-founder", ["baidu", "google", "openai", "anthropic"]),
  entry("sam", "Sam Altman", "sama", "Founder", ["ycombinator", "openai"]),
  entry("dhh", "DHH", "dhh", "Founder", ["basecamp"]),
  entry("truell", "Michael Truell", "mntruell", "Founder", ["cursor", "spacex"]),
  entry("roy", "Roy Lee", "im_roy_lee", "Founder", ["cluely"]),
  entry("dara", "Dara A.", "daradoescode", "At T3", ["amazon", "t3"]),
  entry("julius", "Julius Marminge", "juliusmarminge", "At T3", ["t3"], ["trpc"]),
  entry("rmarked", "mark", "r_marked", "At T3", ["t3"]),
  entry("mario", "Mario Zechner", "badlogicgames", "Builder", ["libgdx", "earendil"]),
  entry("lee", "Lee Robinson", "leerob", "Vercel", ["vercel"], ["nextjs"]),
  entry("ryandahl", "Ryan Dahl", "rough__sea", "Founder", ["joyent", "deno"], ["nodejs"]),
  entry("jhey", "Jhey Tompkins", "jh3yy", "In public", ["google", "youtube"]),
  entry("neet", "NeetCode", "neetcode1", "Teacher", ["google", "youtube"]),
  entry("benawad", "Ben Awad", "benawad", "In public", ["youtube"]),
  entry("fireship", "Jeff Delaney", "fireship_dev", "Teacher", ["youtube"]),
  entry("casey", "Casey Muratori", "cmuratori", "In public", ["molly"]),
  entry("live", "LiveOverflow", "LiveOverflow", "In public", ["youtube"]),
  entry("seb", "Sebastian Lague", "SebastianLague", "In public", ["youtube"]),
  entry("geerling", "Jeff Geerling", "geerlingguy", "In public", ["youtube"]),
  entry("bendavis", "Ben Davis", "bmdavis419", "In public", ["youtube"]),
  entry("carniato", "Ryan Carniato", "RyanCarniato", "In public", ["netlify", "youtube"], ["solid"]),
  entry("karpathy", "Andrej Karpathy", "karpathy", "Researcher", ["openai", "tesla", "eureka", "anthropic"]),
  entry("hammond", "John Hammond", "_JohnHammond", "In public", ["youtube"]),
  entry("bullet", "Code Bullet", "CodeBullet", "In public", ["youtube"]),
  entry("aiden", "Aiden Bai", "aidenybai", "Founder", ["million"]),
  entry("dicken", "Ben Dicken", "benjdicken", "Teacher", ["planetscale"]),
  entry("patrick", "Patrick Collison", "patrickc", "Founder", ["stripe"]),
  entry("tobi", "Tobias Lütke", "tobi", "Founder", ["shopify"]),
  entry("dylan", "Dylan Field", "zoink", "Founder", ["figma"]),
  entry("amjad", "Amjad Masad", "amasad", "Founder", ["replit"]),
  entry("carmack", "John Carmack", "ID_AA_Carmack", "Founder", ["id", "meta", "keen"]),
  entry("palmer", "Palmer Luckey", "PalmerLuckey", "Founder", ["meta", "anduril"]),
  entry("levels", "Pieter Levels", "levelsio", "Founder", ["indie"]),
  entry("garry", "Garry Tan", "garrytan", "President", ["ycombinator"]),
  entry("paulg", "Paul Graham", "paulg", "Founder", ["ycombinator"]),
  entry("jensen", "Jensen Huang", "JensenHuang", "Founder", ["nvidia"]),

  entry("jarred", "Jarred Sumner", "jarredsumner", "Bun", ["stripe", "bun", "anthropic"]),
  entry("rich", "Rich Harris", "Rich_Harris", "Svelte", ["guardian", "nytimes", "vercel"], ["svelte"]),
  entry("evanyou", "Evan You", "youyuxi", "Founder", ["google", "meteor", "voidzero"], ["vue", "vite", "vitest", "rolldown", "oxc"]),
  entry("mitchell", "Mitchell Hashimoto", "mitchellh", "Founder", ["hashicorp", "superlogical"], ["ghostty", "terraform"]),
  entry("armin", "Armin Ronacher", "mitsuhiko", "Founder", ["sentry", "earendil"], ["flask"]),
  entry("tanner", "Tanner Linsley", "tannerlinsley", "Founder", ["nozzle", "tanstack"]),
  entry("steve", "Steve Ruiz", "steveruizok", "Founder", ["tldraw"]),
  entry("kent", "Kent C. Dodds", "kentcdodds", "Teacher", ["paypal", "remix"]),
  entry("simon", "Simon Willison", "simonw", "Datasette", ["lanyrd", "eventbrite"], ["django"]),

  entry("bcherny", "Boris Cherny", "bcherny", "Claude Code", ["meta", "anthropic"]),
  entry("swyx", "swyx", "swyx", "Founder", ["amazon", "netlify", "temporal", "airbyte", "aiengineer"]),
  entry("steipete", "Peter Steinberger", "steipete", "OpenClaw", ["pspdfkit", "openai"], ["openclaw"]),
  entry("gergely", "Gergely Orosz", "GergelyOrosz", "Writer", ["microsoft", "skyscanner", "uber", "pragmatic"]),
  entry("ryanp", "Ryan Peterman", "ryanlpeterman", "Founder", ["amazon", "meta", "compose"]),
  entry("karri", "Karri Saarinen", "karrisaarinen", "Founder", ["airbnb", "coinbase", "linear"]),
  entry("markbage", "Sebastian Markbåge", "sebmarkbage", "Engineer", ["meta", "vercel"], ["react"]),
  entry("acdlite", "Andrew Clark", "acdlite", "Engineer", ["meta", "vercel"], ["react"]),
  entry("gdb", "Greg Brockman", "gdb", "Co-founder", ["stripe", "openai"]),
  entry("jeffdean", "Jeff Dean", "JeffDean", "Founder", ["google", "discoveryloop"]),
  entry("antirez", "Salvatore Sanfilippo", "antirez", "Builder", ["redis"]),
  entry("lex", "Lex Fridman", "lexfridman", "In public", ["mit", "youtube"]),
  entry("dwarkesh", "Dwarkesh Patel", "dwarkesh_sp", "In public", ["youtube"]),
  entry("dougdoug", "DougDoug", "DougDoug", "In public", ["youtube"]),
  entry("lowlevel", "Low Level", "LowLevelTV", "In public", ["youtube"]),

  entry("mira", "Mira Murati", "miramurati", "Founder", ["openai", "thinkingmachines"]),
  entry("ilya", "Ilya Sutskever", "ilyasut", "Founder", ["google", "openai", "ssi"]),
  entry("awang", "Alexandr Wang", "alexandr_wang", "Chief AI Officer", ["scale", "meta"]),
  entry("aravind", "Aravind Srinivas", "AravSrinivas", "Founder", ["perplexity"]),
  entry("demis", "Demis Hassabis", "demishassabis", "Chief Scientist", ["deepmind", "google"]),
  entry("jack", "Jack Dorsey", "jack", "Founder", ["twitter", "block"]),
  entry("pmarca", "Marc Andreessen", "pmarca", "Co-founder", ["netscape", "a16z"]),
  entry("naval", "Naval Ravikant", "naval", "Founder", ["angellist"]),
  entry("satya", "Satya Nadella", "satyanadella", "CEO", ["microsoft"]),
  entry("sundar", "Sundar Pichai", "sundarpichai", "CEO", ["google"]),
  entry("chesky", "Brian Chesky", "bchesky", "Co-founder", ["airbnb"]),
  entry("eich", "Brendan Eich", "BrendanEich", "Founder", ["netscape", "mozilla", "brave"]),
  entry("mkbhd", "Marques Brownlee", "MKBHD", "In public", ["youtube"]),
  entry("rober", "Mark Rober", "MarkRober", "Founder", ["nasa", "apple", "crunchlabs"]),
  entry("tomscott", "Tom Scott", "tomscott", "In public", ["youtube"]),
  entry("grant", "Grant Sanderson", "3blue1brown", "In public", ["khanacademy", "youtube"]),
  entry("derek", "Derek Muller", "veritasium", "In public", ["youtube"]),
  entry("hank", "Hank Green", "hankgreen", "In public", ["youtube"]),
  entry("uwukko", "wukko", "uwukko", "Co-founder", ["imput"], ["helium", "cobalt"]),
  entry("zuck", "Mark Zuckerberg", "finkd", "Founder", ["meta"]),
  entry("fleury", "Ryan Fleury", "ryanjfleury", "RAD Debugger", ["epicgames"]),
];
