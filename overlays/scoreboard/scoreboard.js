const ws = new WebSocket("ws://localhost:3000"); // WebSocket connection
let scoreboardVisibility = false;
let scoreboardWrapper = document.getElementById("scoreboard");

let timerInterval; // To store the interval ID
let totalSeconds = 0; // Timer in seconds
let running = false; // Timer running state
let redCardsHome = 0; // Red cards for home team
let redCardsAway = 0; // Red cards for away team

const pieces = document.querySelectorAll(".piece");

// Handle incoming WebSocket messages
ws.onmessage = (event) => {
  if (event.data instanceof Blob) {
    const reader = new FileReader();
    reader.onload = function () {
      try {
        const data = JSON.parse(reader.result);
        handleMessage(data);
      } catch (error) {
        console.error("❌ Error parsing Blob data:", error);
      }
    };
    reader.readAsText(event.data);
  } else {
    try {
      const data = JSON.parse(event.data);
      handleMessage(data);
    } catch (error) {
      console.error("❌ Error parsing message:", error, event.data);
    }
  }
};

// Handle the parsed data
function handleMessage(data) {
  switch (data.type) {
    case "toggleScoreboard":
      toggleScoreboard();
      break;
    case "homeGoal":
      handleGoal("homeScore", data.scorer);
      break;
    case "awayGoal":
      updateScorePlus("awayScore");
      break;
    case "removeGoalHome":
      updateScoreMinus("homeScore");
      break;
    case "removeGoalAway":
      updateScoreMinus("awayScore");
      break;
    case "startTimer":
      startTimer();
      break;
    case "stopTimer":
      stopTimer();
      break;
    case "setTime":
      setTime(data.minutes, data.seconds);
      break;
    case "setTime45":
      setTime45(data.minutes, data.seconds);
      break;
    case "resetTimer":
      resetTimer();
      break;
    case "resetTimer45":
      resetTimer45(data.minutes, data.seconds);
      break;
    case "substitution":
      showSubstitution(data);
      break;
    case "toggleExtraTime":
      console.log("Toggle extra time");
      showExtraTime(data);
      break;
    case "redCardHome":
      redCardsHome++;
      updateRedCards("home", redCardsHome);
      break;
    case "redCardAway":
      redCardsAway++;
      updateRedCards("away", redCardsAway);
      break;
    case "removeRedCardHome":
      redCardsHome--;
      updateRedCards("home", redCardsHome);
      break;
    case "removeRedCardAway":
      redCardsAway--;
      updateRedCards("away", redCardsAway);
      break;
    case "toggleGoalScorer":
      showGoalScorer(data.team, data.scorer);
      break;
    case "toggleRedCards":
      console.log("Toggle red cards for team:", data.team);
      toggleRedCards(data.team);
      break;
    case "showSubstition":
      showSubstitution(data.playerIn, data.playerOut, data.team);
      break;
  }
}

async function handleGoal(teamId, scorer) {
  await triggerGoalAnimation(scorer);
  updateScorePlus(teamId);
}

function triggerGoalAnimation(text) {
  return new Promise((resolve) => {
    const overlay = document.getElementById("goalOverlay");
    const textEl = document.getElementById("goalText");

    textEl.textContent = "GOOOOLLLLLOOOO!!! " + text;

    overlay.style.opacity = 0; // Hide the overlay
    textEl.style.transition = "none"; // reset animation
    textEl.style.transform = "translateX(100%)"; // Show text

    requestAnimationFrame(() => {
      const textWidth = textEl.offsetWidth; // Get the width of the text
      const overlayWidth = overlay.offsetWidth; // Get the width of the overlay
      const totalDistance = overlayWidth + textWidth; // Total distance to slide

      const duration = (totalDistance / 100) * 1.2; // Adjust duration based on distance
      const entryDelay = (overlayWidth / totalDistance) * (duration/2) * 1000; // Delay before the text starts sliding

      textEl.style.transition = `transform ${duration}s linear`; // Set the transition duration
      textEl.style.transform = `translateX(-${textWidth}px)`; // Slide text out

      setTimeout(() => {
        overlay.style.opacity = 1; // Fade out the overlay
      }, entryDelay); // Wait for the text to finish sliding

      setTimeout(() => {
        overlay.style.opacity = 0; // Fade out the overlay
        resolve(); // Resolve the promise
      }, duration * 1000); // Wait for the text to finish sliding
    });
  });
}

function showGoalScorer(team, scorer) {
  const popup = document.getElementById("goalScorerPopup");
  const text = document.getElementById("goalScorerText");
  const logo = document.getElementById("goalTeamLogo");

  text.textContent = scorer;
  logo.src = team === "home" ? "/assets/84107179.png" : "/assets/Almodovar.png"; // Set the logo based on the team

  popup.classList.add("show");

  setTimeout(() => {
    popup.classList.remove("show");
  }, 4000); // Show for 4 seconds
}

function updateScorePlus(id) {
  const wrapper = document.querySelector(`#${id}`).parentElement;
  const current = document.getElementById(id);
  let newValue = parseInt(current.textContent) + 1;

  const oldScore = current.cloneNode(true);
  oldScore.classList.remove("slide-in");
  oldScore.classList.add("slide-out");

  const newScore = current.cloneNode(true);
  newScore.id = id;
  newScore.textContent = newValue;
  newScore.classList.remove("slide-out");
  newScore.classList.add("slide-in");

  wrapper.innerHTML = ""; // Clear the wrapper
  wrapper.appendChild(oldScore); // Append the old score
  wrapper.appendChild(newScore); // Append the new score

  setTimeout(() => {
    if (wrapper.contains(oldScore)) oldScore.remove();
  }, 500); // Remove the old score after the animation
}

function updateScoreMinus(id) {
  const wrapper = document.querySelector(`#${id}`).parentElement;
  const current = document.getElementById(id);
  let newValue = parseInt(current.textContent) - 1;

  const newScore = document.createElement("span");
  newScore.id = id;
  newScore.textContent = newValue;
  newScore.classList.add("score", "slide-in-right");

  const oldScore = current.cloneNode(true);
  oldScore.classList.remove("slide-in-right");
  oldScore.classList.add("slide-out-right");

  wrapper.innerHTML = ""; // Clear the wrapper
  wrapper.appendChild(oldScore); // Append the old score
  wrapper.appendChild(newScore); // Append the new score

  setTimeout(() => {
    if (oldScore) oldScore.remove();
  }, 500); // Remove the old score after the animation

  setTimeout(() => {
    newScore.classList.remove("slide-in-right");
  }, 500); // Remove the old score after the animation
}

// Timer functions
function startTimer() {
  if (running) return; // Prevent multiple intervals

  running = true;
  timerInterval = setInterval(() => {
    totalSeconds++; // Increment the timer by 1 second
    const minutes = Math.floor(totalSeconds / 60);
    const displaySeconds = totalSeconds % 60;

    // Format time as MM:SS
    document.getElementById("timer").textContent =
      `${minutes < 10 ? "0" : ""}${minutes}:${displaySeconds < 10 ? "0" : ""}${displaySeconds}`;
  }, 1000);
  console.log("Timer started!");
}

function stopTimer() {
  if (!running) return; // Prevent stopping when the timer isn't running

  running = false;
  clearInterval(timerInterval); // Stop the timer
  console.log("Timer stopped!");
  //document.getElementById("timer").textContent = "00:00"; // Reset timer display
}

function setTime(minutes, seconds) {
  clearInterval(timerInterval); // Stop the timer
  running = false; // Reset running state
  totalSeconds = minutes * 60 + seconds; // Calculate total seconds

  document.getElementById("timer").textContent = `${minutes < 10 ? "0" : ""}${minutes}:00`;
  console.log(`Timer set to ${minutes}:${seconds}`);
}

function setTime45 (minutes, seconds) {
  clearInterval(timerInterval); // Stop the timer
  running = false; // Reset running state
  totalSeconds = minutes * 60 + seconds; // Calculate total seconds

  document.getElementById("timer").textContent = `${minutes < 10 ? "0" : ""}${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  console.log(`Timer set to ${minutes}:${seconds}`);
}

function resetTimer() {
  clearInterval(timerInterval); // Stop the timer
  running = false; // Reset running state
  totalSeconds = 0; // Reset total seconds
  document.getElementById("timer").textContent = "00:00"; // Reset timer display
  console.log("Timer reset!");
}

function resetTimer45(minutes, seconds) {
  clearInterval(timerInterval); // Stop the timer
  running = false; // Reset running state
  totalSeconds = minutes * 60 + seconds; // Reset total seconds
  document.getElementById("timer").textContent = `${
    minutes < 10 ? "0" : ""
  }${minutes}:00`;
  console.log(`Timer set to ${minutes}:${seconds}`);
  console.log("Timer reset!");
}

function toggleScoreboard() {
  if (scoreboardVisibility) {
    pieces.forEach((el, i) => {
      el.classList.remove(`enter-${i + 1}`); // Remove enter classes
      el.classList.add(`exit-${i + 1}`);
    });

    setTimeout(() => {
      scoreboardWrapper.style.animation = "slideOut 1s ease forwards";
      setTimeout(() => {
        scoreboardWrapper.style.display = "none";
        pieces.forEach((el) => {
          el.classList.remove(
            "exit-1",
            "exit-2",
            "exit-3",
            "exit-4",
            "exit-5",
            "exit-6"
          ); // Remove all classes
          el.classList.add("piece"); // Add the base class back
        });
      }, 1600); // Wait for the animation to finish before hiding
    }, 1600);
  } else {
    scoreboardWrapper.style.display = "flex";
    scoreboardWrapper.style.animation = "slideIn 1s ease forwards";
    setTimeout(() => {
      pieces.forEach((el, i) => {
        el.classList.remove(
          "exit-1",
          "exit-2",
          "exit-3",
          "exit-4",
          "exit-5",
          "exit-6"
        ); // Remove exit classes
        el.classList.add(`enter-${i + 1}`); // Add enter classes
      });
    }, 500); // Show immediately
  }
  scoreboardVisibility = !scoreboardVisibility; // Toggle visibility state
}

function showExtraTime(data) {
  const extraTimePopup = document.getElementById("extraTimePopup");
  extraTimePopup.textContent = `+${data.minutes}`;
  if (extraTimePopup.classList.contains("show")) {
    extraTimePopup.classList.remove("show");
  } else {
    extraTimePopup.classList.add("show");
  }
}

function updateRedCards(team, count, show = true) {
  const container = document.getElementById(`${team}RedCards`);

  if (!container) return;

  container.innerHTML = ""; // Clear the container

  for (let i = 0; i < count; i++) {
    const redCard = document.createElement("div");
    redCard.className = "red-card";
    container.appendChild(redCard);
  }
}

function toggleRedCards(team) {
  const homeRedCards = document.getElementById("homeRedCards");
  const awayRedCards = document.getElementById("awayRedCards");
  const homeRedCardsVisibility = homeRedCards.checkVisibility();
  const awayRedCardsVisibility = awayRedCards.checkVisibility();
  console.log("Toggling red cards for team:", team);

  if (team === "home") {
    if (homeRedCardsVisibility) {
      homeRedCards.classList.add("hidden");
    } else {
      homeRedCards.classList.remove("hidden");
    }
  } else {
    if (awayRedCardsVisibility) {
      awayRedCards.classList.add("hidden");
      homeRedCards.visibility = false;
    } else {
      awayRedCards.classList.remove("hidden");
      homeRedCards.visibility = true;
    }
  }
}

// Show a substitution with team logos (you can adjust the logo placement and animation)
function showSubstitution(playerIn, playerOut, team) {
  const popup = document.getElementById("subPopup");

  document.getElementById("subInName").textContent = playerIn;
  document.getElementById("subOutName").textContent = playerOut;

  document.getElementById("subInLogo").src = team === "home" ? "/assets/84107179.png" : "/assets/Almodovar.png"; // Set the logo based on the team
  //document.getElementById("subOutLogo").src = team === "home" ? "/assets/84107179.png" : "/assets/Almodovar.png"; // Set the logo based on the team

  const inWrapper = document.getElementById("inWrapper");
  const outWrapper = document.getElementById("outWrapper");

  inWrapper.style.transform = "translateY(0)";
  outWrapper.style.transform = "translateY(0)";

  popup.classList.remove("hide");
  popup.classList.add("show");

  setTimeout(() => {
    inWrapper.style.transform = "translateY(140%)";
    outWrapper.style.transform = "translateY(-140%)";
  }, 2000); // Show for 4 seconds

  setTimeout(() => {
    popup.classList.remove("show"); // Hide the popup after the animation
    popup.classList.add("hide");
  }, 5000); // Show for 4 seconds
}