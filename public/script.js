const parseCookie = (str) =>
  str
    .split(";")
    .map((v) => v.split("="))
    .reduce((acc, v) => {
      acc[decodeURIComponent(v[0].trim())] = decodeURIComponent(v[1].trim());
      return acc;
    }, {});

const cookies = parseCookie(document.cookie);
console.log(cookies);
const token = cookies.get("token");
const toggleChatbot = document.querySelector("#toggle-chatbot");

fetch("/chatbot")
  .then((res) => res.json())
  .then((json) => {
    console.log(json);
    toggleChatbot.checked = json.active;
  });

toggleChatbot.addEventListener("change", (e) => {
  console.log(e.currentTarget.checked);
  if (e.currentTarget.checked) {
    fetch("/chatbot/on?channels=petitbonney").then(console.log);
  } else {
    fetch("/chatbot/off").then(console.log);
  }
});
