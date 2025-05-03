const ws = new WebSocket("ws://localhost:3000"); // WebSocket connection
let matchupVisibilyity = false;
const matchupWrapper = document.getElementById("matchupWrapper");
const pieces = document.querySelectorAll(".piece");
let homeScore = 0;
let awayScore = 0;

ws.onmessage = (event) => {
  if (event.data instanceof Blob) {
    const reader = new FileReader();
    reader.onload = function () {
      try {
        const data = JSON.parse(reader.result);
        handleMessage(data);
      } catch (error) {
        console.error("❌ Error parsing JSON:", error);
      }
    };
    reader.readAsText(event.data);
  } else {
    try {
      const data = JSON.parse(event.data);
      handleMessage(data);
    } catch (error) {
      console.error("❌ Error parsing JSON:", error);
    }
  }
};

function handleMessage(data) {
  console.log(data.type); // Log the type of message received
  if (data.type === "toggleMatchup") {
    toggleMatchup();
  }
  if (data.type === "updateGoalMatchup") {
    updateMatchupData(data); // Update the matchup data
  }
}

function toggleMatchup() {
  const divider = document.getElementById("divider"); // Get the divider element
  const isStart = document.getElementById("homeScore").textContent;

  if (matchupVisibilyity) {
    pieces.forEach((el, i) => {
      el.classList.remove(`enter-${i + 1}`); // Remove enter classes
      el.classList.add(`exit-${i + 1}`);
    });

    setTimeout(() => {
      matchupWrapper.style.animation = "slideDown 1s ease forwards"; // Add animation to the wrapper
      divider.style.animation = "slideDown 1s ease forwards"; // Add animation to the divider
      setTimeout(() => {
        matchupWrapper.style.display = "none"; // Hide the wrapper after animation
        divider.style.display = "none"; // Hide the divider after animation
        pieces.forEach((el) => {
          el.classList.remove(
            "exit-1",
            "exit-2",
            "exit-3",
            "exit-4",
            "exit-5",
            "exit-6",
            "exit-7",
            "exit-8"
          ); // Remove all classes
          el.classList.add("piece"); // Add the base class back
        });
      }, 1600); // Matchup will be hidden after 500ms
    }, 1600); // Matchup will be hidden after 500ms
  } else {
    console.log(isStart);
    if (!isStart) {
      document.getElementById("vsDivider").textContent = "vs"; // Clear the score
      document.getElementById("homeName").classList.remove("home-team");
      document.getElementById("awayName").classList.remove("away-team");
    } else {
      document.getElementById("vsDivider").textContent = " - "; // Clear the score
      document.getElementById("homeName").classList.add("home-team");
      document.getElementById("awayName").classList.add("away-team");
    }
    matchupWrapper.style.display = "flex";
    matchupWrapper.style.animation = "slideUp 1s ease forwards"; // Add animation to the wrapper
    divider.style.animation = "slideUp 1s ease forwards"; // Add animation to the divider
    divider.style.display = "block"; // Show the divider
    setTimeout(() => {
      pieces.forEach((el, i) => {
        el.classList.remove(
          "exit-1",
          "exit-2",
          "exit-3",
          "exit-4",
          "exit-5",
          "exit-6",
          "exit-7",
          "exit-8"
        ); // Remove exit classes
        el.classList.add(`enter-${i + 1}`); // Add enter classes
      });
    }, 500); // Matchup will be shown immediately
  }
  matchupVisibilyity = !matchupVisibilyity;
}

function updateMatchupData(data) {
  console.log(data.team);
  if (data.team === "home") {
    homeScore++;
    document.getElementById("homeScore").textContent = homeScore; // Update the home score
  } else {
    awayScore++;
    document.getElementById("awayScore").textContent = awayScore; // Update the away score
  }
}