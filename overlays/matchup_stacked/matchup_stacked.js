const ws = new WebSocket("ws://localhost:3000");
let matchupVisibility = false; // Flag to track visibility

const pieces = document.querySelectorAll(".piece"); // Select all pieces
const wrapper = document.getElementById("matchupWrapper"); // Select the wrapper

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

function handleMessage(data) {
    console.log(data.type);

    if (data.type === "toggleMatchupStacked") {
        console.log("Toggle Matchup Stacked");
        toggleMatchup();
        return;
    }
    if (data.type === "updateMatchupData") {
        console.log("Update Matchup Data");
        updateMatchupData(data.matchupData);
        return;
    }
}

function updateMatchupData(matchupData) {
  document.getElementById("homeName").textContent = matchupData.homeTeam.name;
  document.getElementById("homeScore").textContent = matchupData.homeTeam.score;
  document.getElementById("homeLogo").src = matchupData.homeTeam.logo;
  document.getElementById("awayName").textContent = matchupData.awayTeam.name;
  document.getElementById("awayScore").textContent = matchupData.awayTeam.score;
  document.getElementById("awayLogo").src = matchupData.awayTeam.logo;
}

function toggleMatchup() {

  if (matchupVisibility) {
    pieces.forEach((el, i) => {
      el.classList.remove(`enter-${i + 1}`); // Remove enter classes
      el.classList.add(`exit-${i + 1}`); // Add exit classes
    });

    setTimeout(() => {
      wrapper.style.animation = "slideDown 1s ease forwards"; // Add animation to the wrapper
      setTimeout(() => {
        wrapper.style.display = "none"; // Hide the wrapper after animation
        pieces.forEach((el) => {
            el.classList.remove("exit-1", "exit-2"); // or use classList iteration
            el.classList.add("piece");
          });
        }, 1000); // Matchup will be hidden after 1000ms
    }, 1000);
  } else {
    wrapper.style.display = "flex"; // Show the wrapper
    wrapper.style.animation = "slideUp 1s ease forwards"; // Add animation to the wrapper

    setTimeout(() => {
      pieces.forEach((el, i) => {
        el.classList.remove("exit-1", "exit-2"); // Remove exit classes
        el.classList.add(`enter-${i + 1}`);
      });
    }, 500);
  }
  matchupVisibility = !matchupVisibility; // Toggle visibility state
}
