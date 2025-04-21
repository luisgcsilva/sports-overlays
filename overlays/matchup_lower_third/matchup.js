const ws = new WebSocket("ws://localhost:3000"); // WebSocket connection
let matchupVisibilyity = false;
const matchupWrapper = document.getElementById("matchupWrapper");
const pieces = document.querySelectorAll(".piece");

console.log(pieces);

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
  if (data.type === "toggleMatchup") {
    toggleMatchup();
  }
}

function toggleMatchup() {
  if (matchupVisibilyity) {
    pieces.forEach((el, i) => {
      el.classList.remove(`enter-${i + 1}`); // Remove enter classes
      el.classList.add(`exit-${i + 1}`);
    });

    setTimeout(() => {
      matchupWrapper.style.animation = "slideDown 0.5s ease forwards"; // Add animation to the wrapper
      setTimeout(() => {
        matchupWrapper.style.display = "none"; // Hide the wrapper after animation
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
      }, 250); // Matchup will be hidden after 500ms
    }, 500); // Matchup will be hidden after 500ms
  } else {
    matchupWrapper.style.display = "flex";
    matchupWrapper.style.animation = "slideUp 0.5s ease forwards"; // Add animation to the wrapper
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
    }, 500); // Matchup will be shown immediately
  }
  matchupVisibilyity = !matchupVisibilyity;
}
