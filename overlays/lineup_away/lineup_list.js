const ws = new WebSocket("ws://localhost:3000");
let lineupVisibility = false;
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
  if (data.type === "toggleAwayLineup") {
    toggleAwayLineup();
  }
}

function toggleAwayLineup() {
  const pieces = Array.from(document.querySelectorAll(".piece"));
  console.log(lineupVisibility);
  if (lineupVisibility) {
    pieces.forEach((el, i) => {
      el.classList.remove(`enter-${i + 1}`);
      el.classList.add(`exit-${i + 1}`);
    });

    const totalExitTime = pieces.length * 200 + 500;
    
    setTimeout(() => {
      lineupWrapper.style.animation = "slideDown 0.5s ease forwards";

      setTimeout(() => {
        pieces.forEach((el) => {
          el.classList.forEach((cls) => {
            if (cls.startsWith("exit-")) {
              el.classList.remove(cls);
            }
          });
          el.classList.add("piece");
        });
        lineupWrapper.style.display = "none";
      }, totalExitTime - 500);
    }, totalExitTime);
  } else {
    lineupWrapper.style.display = "flex";
    lineupWrapper.style.animation = "slideUp 0.5s ease forwards";
    setTimeout(() => {
      pieces.forEach((el, i) => {
        el.classList.forEach((cls) => { 
          if (cls.startsWith("exit-")) {
            el.classList.remove(cls);
          }
        });
        el.classList.add(`enter-${i + 1}`);
      });
    }, 500);
  }

  lineupVisibility = !lineupVisibility;
}
