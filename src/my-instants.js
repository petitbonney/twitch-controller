const os = require("os");
const fs = require("fs");
const axios = require("axios");
const levenshtein = require("fast-levenshtein");

const USER_DIR = os.homedir();
const INSTANTS_JSON = USER_DIR + "/my-instants.json";
const API_URL = "http://www.myinstants.com/api/v1/instants/";
const LEVENSHTEIN_TRESHOLD = 2;

const BAN_WORDS = ["gasm", "moans", "hentai"];

const downloadAllInstants = async () => {
  const instants = {};
  let url = API_URL;
  while (url != null) {
    console.log("Downloading", url);
    await axios
      .get(url)
      .then((res) => res.data)
      .then((data) => {
        url = data.next;
        for (const d of data.results) {
          if (!BAN_WORDS.some((w) => d.slug.includes(w))) {
            const trimed = d.slug.replaceAll(/[^\w]/g, " ").trim();
            instants[trimed] = d.sound;
          }
        }
      })
      .catch((err) => {
        console.log(err.response.data);
        url = null;
      });
  }
  fs.writeFileSync(INSTANTS_JSON, JSON.stringify(instants), (err) => {
    if (err) {
      console.log(err);
    }
  });
};

const findInstant = async (instants, search) => {
  let minDist, nearestSlug, nearestSound;
  for (const [slug, sound] of Object.entries(instants)) {
    // search in slug
    if (slug.includes(search)) {
      return [slug, sound];
    }

    // levenshtein < threshold
    const dist = Math.min(slug.split("-").map((s) => levenshtein.get(s, search)));
    if (dist < LEVENSHTEIN_TRESHOLD) {
      return [slug, sound];
    }

    // nearest
    if (!minDist || dist < minDist) {
      minDist = dist;
      nearestSlug = slug;
      nearestSound = sound;
    }
  }
  return [nearestSlug, nearestSound];
};

exports.getInstant = async (search, nearest = false) => {
  if (!fs.existsSync(INSTANTS_JSON)) {
    await downloadAllInstants();
  }
  const instants = JSON.parse(fs.readFileSync(INSTANTS_JSON));
  let slug = search;
  let sound = instants[slug];
  if (!sound && nearest) {
    [slug, sound] = await findInstant(instants, slug);
    console.log({ slug, sound });
  }
  return sound;
};
