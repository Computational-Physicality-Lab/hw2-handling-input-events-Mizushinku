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
    } else if (followingTarget) {
      followingTarget.style.top = backup.top;
      followingTarget.style.left = backup.left;
      followingTarget = null;
    }
  }
});

/******* WorkSpace Code Zone *******/
const workspace = document.getElementById("workspace");

var isWsDown = false;

workspace.addEventListener("pointerdown", (e) => {
  console.log("WS Down");
  isWsDown = true;
  if (followingTarget && e.pointerType == "touch") {
    followingTarget.style.left = `${e.clientX}px`;
    followingTarget.style.top = `${e.clientY}px`;
  }
});
workspace.addEventListener("pointerup", (e) => {
  console.log("WS Up");
  longPressTarget = null;
  if (followingTarget && e.pointerType == "touch") {
    followingTarget.style.left = `${e.clientX}px`;
    followingTarget.style.top = `${e.clientY}px`;
  }
  if (e.pointerType == "touch") {
    // isWsDown = false;
  }
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
  } else if (followingTarget) {
    followingTarget.style.left = `${e.clientX}px`;
    followingTarget.style.top = `${e.clientY}px`;
  }
});

/******* Targets Code Zone *******/
const targets = document.querySelectorAll(".target");

var focusedTarget = null;

var longPressTimer = null;
var longPressTarget = null;
var longPressLag = 700;

var tapTimer = null;
var isTap = false;
var tapPos = {
  posX: null,
  posY: null,
};
var tapLag = 350;

var doubleTapTimer = null;
var duringFirstTap = false;
var followingTarget = null;
var doubleTapLag = 350;

var backup = {
  top: null,
  left: null,
  width: null,
  height: null,
};

targets.forEach((target) => {
  target.addEventListener("click", targetOnClick);
  target.addEventListener("dblclick", targetOnDoubleClick);

  target.addEventListener("pointerdown", (e) => {
    if (!(followingTarget && e.pointerType == "touch")) {
      e.stopPropagation();
    }
    console.log(`Down, target = ${e.target.style.top}`);
    if (e.pointerType == "touch") {
      isTap = true;
      tapPos.posX = e.pageX;
      tapPos.posY = e.pageY;
      tapTimer = setTimeout(() => {
        isTap = false;
      }, tapLag);
    }
    if (!followingTarget) {
      longPressTimer = setTimeout(longPress.bind(e), longPressLag);
    }
  });
  target.addEventListener("pointerup", (e) => {
    e.stopPropagation();
    console.log(`Up, target = ${e.target.style.top}`);
    clearTimeout(longPressTimer);
    if (longPressTarget !== e.target || e.pointerType == "touch") {
      longPressTarget = null;
    }

    //TouchUp -> Click
    if (e.pointerType == "touch") {
      if (
        isTap &&
        Math.abs(e.pageX - tapPos.posX) <= 30 &&
        Math.abs(e.pageY - tapPos.posY) <= 30
      ) {
        isTap = false;
        clearTimeout(tapTimer);
        targetOnClick(e);
      }
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
    // e.preventDefault();
  });
  target.addEventListener("touchend", (e) => {
    // e.preventDefault();
  });
});

/******* Functions *******/

function longPress() {
  let e = this; //long press event "e".
  console.log(`LP ${e.target.style.top}`);
  clearTimeout(longPressTimer);
  longPressTarget = e.target;
  backup.top = e.target.style.top;
  backup.left = e.target.style.left;
  backup.width = e.target.style.width;
  backup.height = e.target.style.height;
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
  if (followingTarget) {
    followingTarget = null;
    return;
  }
  console.log(`Click, target = ${e.target.style.top}`);
  let isSameTarget = focusedTarget === e.target;
  setFocus(e.target);

  //double tap
  if (e.pointerType == "touch") {
    if (duringFirstTap) {
      clearTimeout(doubleTapTimer);
      duringFirstTap = false;
      if (isSameTarget) {
        targetOnDoubleClick(e);
      }
    } else {
      duringFirstTap = true;
      doubleTapTimer = setTimeout(() => {
        duringFirstTap = false;
      }, doubleTapLag);
    }
  }
}

function targetOnDoubleClick(e) {
  console.log(`Double Click, target : ${e.target.style.top}`);
  followingTarget = e.target;
  backup.top = e.target.style.top;
  backup.left = e.target.style.left;
  backup.width = e.target.style.width;
  backup.height = e.target.style.height;
}
