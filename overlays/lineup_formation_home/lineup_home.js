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

    const totalExitTime = pieces.length * 100 + 500; // Calculate total exit time based on number of pieces

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
  // Clear all formation rows
  document.getElementById('forwardsRow').innerHTML = '';
  document.getElementById('midfieldersRow').innerHTML = '';
  document.getElementById('defendersRow').innerHTML = '';
  document.getElementById('goalkeeperRow').innerHTML = '';

  // Group players by position
  const playersByPosition = {
    GK: [],
    DF: [],
    MF: [],
    FW: []
  };

  // Sort players into their respective positions
  data.startingXI.forEach(player => {
    if (playersByPosition[player.position]) {
      playersByPosition[player.position].push(player);
    }
  });

  // Create player cards for each position
  Object.entries(playersByPosition).forEach(([position, players]) => {
    const rowId = position === 'GK' ? 'goalkeeperRow' : 
                 position === 'DF' ? 'defendersRow' :
                 position === 'MF' ? 'midfieldersRow' : 'forwardsRow';
    
    const row = document.getElementById(rowId);
    
    players.forEach(player => {
      const playerCard = document.createElement('div');
      playerCard.className = 'player-card piece';
      playerCard.dataset.position = position;
      
      playerCard.innerHTML = `
        <img src="${player.photo}" alt="${player.name}" class="player-photo">
        <div class="player-info">
          <span class="number">${player.number}</span>
          <span class="name">${player.name}</span>
        </div>
      `;
      
      row.appendChild(playerCard);
    });
  });

  // Handle substitutes
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
    });
}
