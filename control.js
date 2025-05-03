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
  sendMatchupGoal();
}

function sendMatchupGoal() {
  ws.send(JSON.stringify({ type: "updateGoalMatchup", team: "home" }));
}

function toggleHomeGoalScorer() {
  const scorer = document.getElementById("scorer").value;
  ws.send(
    JSON.stringify({ type: "toggleGoalScorer", team: "home", scorer: scorer })
  );
}

function toggleAwayGoalScorer() {
  const scorer = document.getElementById("scorer").value;
  ws.send(
    JSON.stringify({ type: "toggleGoalScorer", team: "away", scorer: scorer })
  );
}

function removeGoalHome() {
  ws.send(JSON.stringify({ type: "removeGoalHome", team: "home" }));
}

function goalAway() {
  ws.send(JSON.stringify({ type: "awayGoal", team: "away" }));
  sendMatchupGoal();
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
  ws.send(
    JSON.stringify({
      type: "showSubstition",
      team: "home",
      playerIn,
      playerOut,
    })
  );
}

function sendSubAway() {
  const playerIn = document.getElementById("subInName").value;
  const playerOut = document.getElementById("subOutName").value;
  ws.send(
    JSON.stringify({
      type: "showSubstition",
      team: "away",
      playerIn,
      playerOut,
    })
  );
}

function toggleRefLineup() {
  ws.send(JSON.stringify({ type: "toggleRefLineup" }));
}

function toggleHomeLineup() {
  ws.send(JSON.stringify({ type: "toggleHomeLineup" }));
}

function toggleAwayLineup() {
  ws.send(JSON.stringify({ type: "toggleAwayLineup" }));
}

function sendMatchupData() {
  const homeTeam = document.getElementById("inputHomeName").value;
  const homeLogo = `/assets/logos/${
    document.getElementById("inputHomeLogo").value
  }.png`;
  const homeScore = document.getElementById("inputHomeScore").value;
  const awayTeam = document.getElementById("inputAwayName").value;
  const awayLogo = `/assets/logos/${
    document.getElementById("inputAwayLogo").value
  }.png`;
  const awayScore = document.getElementById("inputAwayScore").value;
  const data = {
    homeTeam: {
      name: homeTeam,
      logo: homeLogo,
      score: homeScore,
    },
    awayTeam: {
      name: awayTeam,
      logo: awayLogo,
      score: awayScore,
    },
  };

  ws.send(JSON.stringify({ type: "updateMatchupData", matchupData: data }));
}

function toggleMatchupStacked() {
  ws.send(JSON.stringify({ type: "toggleMatchupStacked" }));
}

function collectLineupData() {
  const lineup = {
    startingXI: [],
    substitutes: [],
  };

  // Collect starting XI data
  for (let i = 0; i < 11; i++) {
    pNumber = document.getElementById(`player${i}_number`).value;
    const player = {
      number: pNumber,
      name: document.getElementById(`player${i}_name`).value,
      position: document.getElementById(`player${i}_position`).value,
      photo: `/assets/players/${pNumber}.png`, // Assuming the photo is named by the number
    };
    lineup.startingXI.push(player);
  }

  // Collect substitutes data
  for (let i = 0; i < 7; i++) {
    const pNumber = document.getElementById(`sub${i}_number`).value;
    if (pNumber) {
      const sub = {
        number: document.getElementById(`sub${i}_number`).value,
        name: document.getElementById(`sub${i}_name`).value,
        photo: `/assets/players/${pNumber}.png`,
      };
      lineup.substitutes.push(sub);
    }
  }

  return lineup;
}

function sendLineup() {
  const lineup = collectLineupData();
  // Send to WebSocket
  ws.send(
    JSON.stringify({
      type: "updateLineup",
      lineup: lineup,
    })
  );
}

const lineupFormHTML = `
    <div class="lineup-form">
      <h2>Team Lineup Manager</h2>
      <!-- Starting XI -->
      <h3>Starting XI</h3>
      <div class="starting-xi-grid">
          <div class="player-input-row header">
              <span>Number</span>
              <span>Name</span>
              <span>Position</span>
          </div>
          ${Array.from({ length: 11 })
            .map(
              (_, i) => `
              <div class="player-input-row">
                  <input type="number" id="player${i}_number" placeholder="#" />
                  <input type="text" id="player${i}_name" placeholder="Player Name" />
                  <select id="player${i}_position">
                      <option value="GK">Goalkeeper</option>
                      <option value="DF">Defender</option>
                      <option value="MF">Midfielder</option>
                      <option value="FW">Forward</option>
                  </select>
              </div>
          `
            )
            .join("")}
      </div>

      <!-- Substitutes -->
      <h3>Substitutes</h3>
      <div class="subs-grid">
          ${Array.from({ length: 7 })
            .map(
              (_, i) => `
              <div class="player-input-row">
                  <input type="number" id="sub${i}_number" placeholder="#" />
                  <input type="text" id="sub${i}_name" placeholder="Sub Name" />
              </div>
          `
            )
            .join("")}
      </div>

      <div class="lineup-buttons">
          <button onclick="saveLineup()">Save Lineup</button>
          <button onclick="loadLineup()">Load Lineup</button>
          <button onclick="sendLineup()">Send to Overlay</button>
      </div>
    </div>
  `;

// Inject into the page
document.getElementById("lineupFormContainer").innerHTML = lineupFormHTML;
