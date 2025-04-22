const ws = new WebSocket("ws://localhost:3000");
console.log("WebSocket readyState:", ws.readyState);
ws.onopen = () => console.log("✅ WebSocket connected");
ws.onclose = () => console.log("❌ WebSocket disconnected");

ws.onmessage = (event) => {
  console.log("Received:", event.data);
};

function setTime() {
  ws.send(JSON.stringify({ type: "setTime", minutes: 0, seconds: 0 }));
}

function setTime45() {
  ws.send(JSON.stringify({ type: "setTime45", minutes: 45, seconds: 0 }));
}

function startTimer() {
  ws.send(JSON.stringify({ type: "startTimer" }));
}

function stopTimer() {
  ws.send(JSON.stringify({ type: "stopTimer" }));
}

function resetTimer() {
  ws.send(JSON.stringify({ type: "resetTimer" }));
}

function resetTimer45() {
  ws.send(JSON.stringify({ type: "resetTimer45", minutes: 45, seconds: 0 }));
}

function sendGoal() {
  const team = document.getElementById("goalTeam").value;
  const scorer = document.getElementById("goalScorer").value;
  ws.send(JSON.stringify({ type: "goal", team, scorer }));
}

function goalHome() {
  const scorer = document.getElementById("scorer").value;
  ws.send(JSON.stringify({ type: "homeGoal", team: "home", scorer: scorer }));
}

function toggleHomeGoalScorer(){
  const scorer = document.getElementById("scorer").value;
  ws.send(JSON.stringify({ type: "toggleGoalScorer", team: "home", scorer: scorer }));
}

function toggleAwayGoalScorer(){
  const scorer = document.getElementById("scorer").value;
  ws.send(JSON.stringify({ type: "toggleGoalScorer", team: "away", scorer: scorer }));
}
 
function removeGoalHome() {
  ws.send(JSON.stringify({ type: "removeGoalHome", team: "home" }));
}

function resetGoalsHome() {}

function goalAway() {
  ws.send(JSON.stringify({ type: "awayGoal", team: "away" }));
}

function removeGoalAway() {
  ws.send(JSON.stringify({ type: "removeGoalAway", team: "away" }));
}

function sendCard(type) {
  const team = document.getElementById("cardTeam").value;
  ws.send(JSON.stringify({ type, team }));
}

function sendSub() {
  const team = document.getElementById("subTeam").value;
  ws.send(JSON.stringify({ type: "substitution", team }));
}

function toggleScoreboard() {
  ws.send(JSON.stringify({ type: "toggleScoreboard" }));
}

function toggleMatchup() {
  ws.send(JSON.stringify({ type: "toggleMatchup" }));
}

function toggleExtraTime() {
  const extraTime = document.getElementById("extra-time").value;
  ws.send(JSON.stringify({ type: "toggleExtraTime", minutes: extraTime }));
}

function redCardHome() {
  ws.send(JSON.stringify({ type: "redCardHome", team: "home" }));
}

function redCardAway() {
  ws.send(JSON.stringify({ type: "redCardAway", team: "away" }));
}

function removeRedCardHome() {
  ws.send(JSON.stringify({ type: "removeRedCardHome", team: "home" }));
}

function removeRedCardAway() {
  ws.send(JSON.stringify({ type: "removeRedCardAway", team: "away" }));
}

function toggleHomeRedCards() {
  ws.send(JSON.stringify({ type: "toggleRedCards", team: "home" }));
}

function toggleAwayRedCards() {
  ws.send(JSON.stringify({ type: "toggleRedCards", team: "away" }));
}

function sendSubHome() {
  const playerIn = document.getElementById("subInName").value;
  const playerOut = document.getElementById("subOutName").value;
  ws.send(JSON.stringify({ type: "showSubstition", team: "home", playerIn, playerOut }));
}

function sendSubAway() {
  const playerIn = document.getElementById("subInName").value;
  const playerOut = document.getElementById("subOutName").value;
  ws.send(JSON.stringify({ type: "showSubstition", team: "away", playerIn, playerOut }));
}