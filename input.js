/*
* all the code for homework 2 goes into this file.
You will attach event handlers to the document, workspace, and targets defined in the html file
to handle mouse, touch and possible other events.

You will certainly need a large number of global variables to keep track of the current modes and states
of the interaction.
*/

document.body.addEventListener("keydown", (e) => {
  if (e.key == "Escape") {
    if (longPressTarget) {
      longPressTarget.style.top = backup.top;
      longPressTarget.style.left = backup.left;
      longPressTarget = null;
    }
  }
});

/******* WorkSpace Code Zone *******/
const workspace = document.getElementById("workspace");

var isWsDown = false;

workspace.addEventListener("pointerdown", () => {
  console.log("WS Down");
  isWsDown = true;
});
workspace.addEventListener("pointerup", () => {
  console.log("WS Up");
  longPressTarget = null;
});
workspace.addEventListener("click", (e) => {
  if (isWsDown) {
    console.log("WS Click");
    if (focusedTarget) {
      focusedTarget.style.backgroundColor = "red";
      focusedTarget = null;
    }
    isWsDown = false;
  }
});
workspace.addEventListener("pointermove", (e) => {
  if (e.isPrimary && longPressTarget) {
    longPressTarget.style.left = `${e.clientX}px`;
    longPressTarget.style.top = `${e.clientY}px`;
  }
});

/******* Targets Code Zone *******/
const targets = document.querySelectorAll(".target");

var focusedTarget = null;
var duringFirstTap = false;
var longPressTimer = null;
var longPressTarget = null;
var backup = {
  top: null,
  left: null,
  width: null,
  height: null,
};

targets.forEach((target) => {
  target.addEventListener("click", targetOnClick);
  target.addEventListener("dblclick", (e) => {
    console.log(`Double   Click, target = ${e.target.style.top}`);
  });

  target.addEventListener("pointerdown", (e) => {
    e.stopPropagation();
    console.log(`Down, target = ${e.target.style.top}`);
    longPressTimer = setTimeout(longPress.bind(e), 500);
  });
  target.addEventListener("pointerup", (e) => {
    e.stopPropagation();
    console.log(`Up, target = ${e.target.style.top}`);
    if (longPressTarget !== e.target) {
      longPressTarget = null;
    }
    clearTimeout(longPressTimer);

    //TouchUp -> Click
    if (e.pointerType == "touch") {
      targetOnClick(e);
    }
  });

  target.addEventListener("pointercancel", (e) => {
    console.log(`Cancel, target = ${e.target.style.top}`);
  });
  target.addEventListener("pointerout", (e) => {
    // console.log(`Out, target = ${e.target.style.top}`);
    clearTimeout(longPressTimer);
  });

  target.addEventListener("touchstart", (e) => {
    e.preventDefault();
  });
});

function longPress() {
  let e = this; //long press event "e".
  console.log(`LP ${e.target.style.top}`);
  longPressTarget = e.target;
  backup.top = e.target.style.top;
  backup.left = e.target.style.left;
}

function setFocus(ele) {
  if (focusedTarget) {
    focusedTarget.style.backgroundColor = "red";
  }
  focusedTarget = ele;
  focusedTarget.style.backgroundColor = "#00f";
}

function targetOnClick(e) {
  e.stopPropagation();
  if (longPressTarget) {
    longPressTarget = null;
    return;
  }
  console.log(`Click, target = ${e.target.style.top}`);
  setFocus(e.target);
}
