const ws = new WebSocket("ws://localhost:3000"); // WebSocket connection
let matchupVisibilyity = false;
const matchupWrapper = document.getElementById("matchupWrapper");
const pieces = document.querySelectorAll(".piece");

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
  const divider = document.getElementById("divider"); // Get the divider element
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
            "exit-6"
          ); // Remove all classes
          el.classList.add("piece"); // Add the base class back
        });
      }, 1600); // Matchup will be hidden after 500ms
    }, 1600); // Matchup will be hidden after 500ms
  } else {
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
          "exit-6"
        ); // Remove exit classes
        el.classList.add(`enter-${i + 1}`); // Add enter classes
      });
    }, 500); // Matchup will be shown immediately
  }
  matchupVisibilyity = !matchupVisibilyity;
}
