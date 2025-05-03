const ws = new WebSocket("ws://localhost:3000");
let lineupVisibilyity = false;
const lineupWrapper = document.getElementById("lineupWrapper");

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
  if (data.type === "updateLineup") {
    populateFormation(data.lineup);
  }
  if (data.type === "toggleHomeLineup") {
    toggleHomeLineup();
  }
}

function toggleHomeLineup() {
  const pieces = Array.from(document.querySelectorAll(".piece"));
  if (lineupVisibilyity) {
    pieces.forEach((el, i) => {
      el.classList.remove(`enter-${i + 1}`); // Remove enter classes
      el.classList.add(`exit-${i + 1}`);
    });

    console.log(pieces);

    const totalExitTime = pieces.length * 200 + 500; // Calculate total exit time based on number of pieces

    setTimeout(() => {
      lineupWrapper.style.animation = "slideDown 1s ease forwards";
      setTimeout(() => {
        pieces.forEach((el) => {
          el.classList.forEach((cls) => {
            if (cls.startsWith("exit-")) {
              console.log(cls);
              el.classList.remove(cls); // Remove exit classes
            }
          }); // Remove all classes
          el.classList.add("piece");
        });
        // Add the base class back
        lineupWrapper.style.display = "none"; // Hide the wrapper after animation
      }, totalExitTime - 500);
    }, totalExitTime); // Matchup will be hidden after 500ms
  } else {
    lineupWrapper.style.display = "flex";
    lineupWrapper.style.animation = "slideUp 1s ease forwards"; // Add animation to the wrapper
    setTimeout(() => {
      pieces.forEach((el, i) => {
        el.classList.forEach((cls) => {
          if (cls.startsWith("exit-")) {
            el.classList.remove(cls); // Remove exit classes
          }
        }); // Remove all classes
        el.classList.add(`enter-${i + 1}`); // Add enter classes
      }); // Matchup will be hidden after 500ms
    }, 500);
  }
  lineupVisibilyity = !lineupVisibilyity; // Toggle visibility state
}

function populateFormation(data) {
  const positions = {
    GK: document.querySelector(".goalkeeper .player-card"),
    DF: document.querySelectorAll(".defenders .player-card"),
    MF: document.querySelectorAll(".midfielders .player-card"),
    FW: document.querySelectorAll(".forwards .player-card"),
  };

  data.startingXI.forEach((player) => {
    const playerHTML = `
            <img src="${player.photo}" alt="${player.name}" class="player-photo">
            <div class="player-info">
                <span class="number">${player.number}</span>
                <span class="name">${player.name}</span>
            </div>
        `;

    if (player.position === "GK") {
      positions.GK.innerHTML = playerHTML;
    } else {
      const positionElements = positions[player.position];
      const emptySlot = Array.from(positionElements).find(
        (el) => !el.innerHTML
      );
      if (emptySlot) {
        emptySlot.innerHTML = playerHTML;
      }
    }
  });

  document.getElementById("subsList").innerHTML = ""; // Clear previous substitutes
  data.substitutes
    .filter((sub) => sub && sub.name)
    .forEach((sub) => {
      const subHTML = `
            <div class="sub-player piece">
            <img src="${sub.photo}" alt="${sub.name}" class="player-photo">
                <div class="sub-info">
                    <span class="number">${sub.number}</span>
                    <span class="name">${sub.name}</span>
                </div>
            </div>
        `;
      document.getElementById("subsList").innerHTML += subHTML;
    }); // Call the function to toggle visibility
}
