/*
* all the code for homework 2 goes into this file.
You will attach event handlers to the document, workspace, and targets defined in the html file
to handle mouse, touch and possible other events.

You will certainly need a large number of global variables to keep track of the current modes and states
of the interaction.
*/
const workspace = document.getElementById("workspace");
const targets = document.querySelectorAll(".target");

function initWorkspace() {
  //   let showDot = false;
  //   workspace.addEventListener("pointerdown", (e) => {
  //     if (showDot) {
  //       const dot = document.createElement("div");
  //       dot.classList.add("dot");
  //       dot.id = e.pointerId;
  //       paintDot(e, dot);
  //       document.body.append(dot);
  //     }
  //   });
  //   workspace.addEventListener("pointermove", (e) => {
  //     if (showDot) {
  //       const dot = document.getElementById(e.pointerId);
  //       if (dot == null) return;
  //       paintDot(e, dot);
  //     }
  //   });
  //   workspace.addEventListener("pointerup", (e) => {
  //     if (showDot) {
  //       const dot = document.getElementById(e.pointerId);
  //       if (dot == null) return;
  //       dot.remove();
  //     }
  //   });
}
function paintDot(e, dot) {
  let scaler = 15;
  dot.style.width = `${e.width * scaler}px`;
  dot.style.height = `${e.height * scaler}px`;
  dot.style.left = `${e.clientX}px`;
  dot.style.top = `${e.clientY}px`;
}
function selection(e) {
  console.log(e.target);
  console.log(document.activeElement);
  console.log(e.target === document.activeElement);
}
initWorkspace();

targets.forEach((target) => {
  target.addEventListener("pointerdown", (e) => {
    console.log(`Down, target = ${e.target.style.top}`);
    e.stopPropagation();
  });
  target.addEventListener("pointerup", (e) => {
    console.log(`Up, target = ${e.target.style.top}`);
    selection(e);
    e.stopPropagation();
  });
});
