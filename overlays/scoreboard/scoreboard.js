const ws = new WebSocket("ws://localhost:3000"); // WebSocket connection
let scoreboardVisibility = false;
let scoreboardWrapper = document.getElementById("scoreboard");

let timerInterval; // To store the interval ID
let totalSeconds = 0; // Timer in seconds
let running = false; // Timer running state

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
  if (data.type === "showScoreboard") {
    const scoreboard = document.getElementById("scoreboard");
    scoreboard.style.display = "flex";
    scoreboard.style.animation = "fadeIn 0.5s forwards";
    localStorage.setItem("scoreboardVisibility", "shown");
  }
  if (data.type === "hideScoreboard") {
    const scoreboard = document.getElementById("scoreboard");
    scoreboard.style.animation = "fadeOut 0.5s forwards";
    setTimeout(() => {
      scoreboard.style.display = "none";
    }, 500); // Wait for the animation to finish before hiding
    localStorage.setItem("scoreboardVisibility", "hidden");
  }
  if (data.type === "homeGoal") {
    const el = document.getElementById("homeScore");
    //el.textContent = parseInt(el.textContent) + 1;
    handleGoal("homeScore", data.scorer);
  }
  if (data.type === "awayGoal") {
    const el = document.getElementById("awayScore");

    handleGoal("awayScore");
    //el.textContent = parseInt(el.textContent) + 1;
  }
  if (data.type === "removeGoalHome") {
    const el = document.getElementById("homeScore");
    //el.textContent = parseInt(el.textContent) - 1;
    updateScoreMinus("homeScore", parseInt(el.textContent) - 1);
  }
  if (data.type === "removeGoalAway") {
    const el = document.getElementById("awayScore");
    //el.textContent = parseInt(el.textContent) - 1;
    updateScoreMinus("awayScore", parseInt(el.textContent) - 1);
  }
  // Handle other types of messages (like timer, substitution, etc.)
  if (data.type === "startTimer") {
    startTimer();
  }
  if (data.type === "stopTimer") {
    stopTimer();
  }
  if (data.type === "setTime45") {
    setTime45(data.minutes, data.seconds);
  }
  if (data.type === "setTime") {
    setTime(data.minutes, data.seconds);
  }
  if (data.type === "resetTimer") {
    resetTimer();
  }
  if (data.type === "resetTimer45") {
    resetTimer45(data.minutes, data.seconds);
  }
  if (data.type === "substitution") {
    showSubstitution(data);
  }
  
}

async function handleGoal(teamId, scorer) {
  await triggerGoalAnimation(scorer);
  const el = document.getElementById(teamId);
  updateScorePlus(teamId, parseInt(el.textContent) + 1);
}

function triggerGoalAnimation(text) {
  return new Promise((resolve) => {
    const overlay = document.getElementById("goalOverlay");
    const textEl = document.getElementById("goalText");

    textEl.textContent = "GOOOOLLLLLOOOO!!!             DE             " + text;

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

function updateScorePlus(id, newValue) {
  const wrapper = document.querySelector(`#${id}`).parentElement;
  const current = document.getElementById(id);

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

function updateScoreMinus(id, newValue) {
  const wrapper = document.querySelector(`#${id}`).parentElement;
  const current = document.getElementById(id);

  const oldScore = current.cloneNode(true);
  oldScore.classList.remove("slide-out");
  oldScore.classList.add("slide-in");

  const newScore = current.cloneNode(true);
  newScore.id = id;
  newScore.textContent = newValue;
  newScore.classList.remove("slide-in");
  newScore.classList.add("slide-out");

  wrapper.innerHTML = ""; // Clear the wrapper
  wrapper.appendChild(oldScore); // Append the old score
  wrapper.appendChild(newScore); // Append the new score

  setTimeout(() => {
    if (wrapper.contains(oldScore)) oldScore.remove();
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

function checkScoreboardVisibility() {
  const scoreboard = document.getElementById("scoreboard");
  const visibility = localStorage.getItem("scoreboardVisibility");
  console.log(visibility);
  if (visibility === "shown") {
    console.log("Scoreboard is shown");
    scoreboard.style.display = "block";
  } else {
    console.log("Scoreboard is hidden");
    scoreboard.style.display = "none";
  }

  window.onload = checkScoreboardVisibility;
}

// Show a substitution with team logos (you can adjust the logo placement and animation)
function showSubstitution(data) {
  const substitutionPopup = document.getElementById("substitutionPopup");
  substitutionPopup.textContent = `${data.team} Substitution: ${data.playerIn} in, ${data.playerOut} out`;

  // Show the logo (you'll need to set your logos in the HTML)
  const logo = document.getElementById(data.team + "Logo");
  if (logo) {
    logo.style.opacity = 1;
  }

  // Show substitution popup
  substitutionPopup.style.opacity = 1;
  setTimeout(() => {
    substitutionPopup.style.opacity = 0;
    if (logo) {
      logo.style.opacity = 0;
    }
  }, 4000);
}