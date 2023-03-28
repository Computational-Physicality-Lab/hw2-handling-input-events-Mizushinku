/*
* all the code for homework 2 goes into this file.
You will attach event handlers to the document, workspace, and targets defined in the html file
to handle mouse, touch and possible other events.

You will certainly need a large number of global variables to keep track of the current modes and states
of the interaction.
*/

var focusedTarget = null;

var inLongPress = false;
var longPressTarget = null;
var longPressLag = 500;

var tapPos = {
  posX: null,
  posY: null,
};

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
var isAborted = false;
// var evStack = [];

window.oncontextmenu = (e) => {
  if (e.pointerType == "touch") {
    return false;
  }
};

document.body.addEventListener("keydown", (e) => {
  if (e.key == "Escape") {
    abort();
  }
});
/***********************************/
/******* WorkSpace Code Zone *******/
/***********************************/

const workspace = document.getElementById("workspace");

var isWsDown = false;

workspace.addEventListener("pointerdown", (e) => {
  console.log("WS Down");
  if (followingTarget && e.pointerType == "touch") {
    if (e.isPrimary) {
      followingTarget.style.left = `${e.clientX}px`;
      followingTarget.style.top = `${e.clientY}px`;
    } else {
      abort();
      return;
    }
  }
  isWsDown = true;
});
workspace.addEventListener("pointerup", (e) => {
  console.log("WS Up");
  longPressTarget = null;
  isAborted = false;
  if (followingTarget && e.pointerType == "touch") {
    followingTarget.style.left = `${e.clientX}px`;
    followingTarget.style.top = `${e.clientY}px`;
  }
});
workspace.addEventListener("click", (e) => {
  if (e.isPrimary && isWsDown) {
    console.log("WS Click");
    if (followingTarget) {
      followingTarget = null;
      isAborted = false;
    } else if (focusedTarget) {
      focusedTarget.style.backgroundColor = "red";
      focusedTarget = null;
    }
    isWsDown = false;
  }
});
workspace.addEventListener("pointermove", (e) => {
  if (e.isPrimary && longPressTarget) {
    inLongPress = true;
    longPressTarget.style.left = `${e.clientX}px`;
    longPressTarget.style.top = `${e.clientY}px`;
  } else if (e.isPrimary && followingTarget) {
    followingTarget.style.left = `${e.clientX}px`;
    followingTarget.style.top = `${e.clientY}px`;
  }
});

/*********************************/
/******* Targets Code Zone *******/
/*********************************/

const targets = document.querySelectorAll(".target");

targets.forEach((target) => {
  target.addEventListener("click", targetOnClick);
  target.addEventListener("dblclick", targetOnDoubleClick);

  target.addEventListener("pointerdown", (e) => {
    console.log(`Down, ${e.pointerType}, ${e.isPrimary}`);
    if (followingTarget) {
      return;
    }
    e.stopPropagation();
    console.log(`Down, target = ${e.target.style.top}`);
    if (!e.isPrimary) {
      abort();
      return;
    }
    longPress(e);
  });

  target.addEventListener("pointerup", (e) => {
    console.log(`Up, ${e.pointerType}, ${e.isPrimary}`);
    if (followingTarget) {
      return;
    }
    e.stopPropagation();
    console.log(`Up, target = ${e.target.style.top}`);
    if (!e.isPrimary) {
      return;
    }
    if (longPressTarget !== e.target || e.pointerType == "touch") {
      inLongPress = false;
      longPressTarget = null;
      isAborted = false;
    }
    if (!inLongPress && longPressTarget) {
      longPressTarget = null;
    }
  });

  target.addEventListener("pointercancel", (e) => {
    console.log(`Cancel, target = ${e.target.style.top}`);
  });
  target.addEventListener("pointerout", (e) => {
    // console.log(`Out, target = ${e.target.style.top}`);
  });
});

/*************************/
/******* Functions *******/
/*************************/

function longPress(e) {
  // let e = this; //long press event "e".
  // console.log(`LP ${e.target.style.top}`);
  // clearTimeout(longPressTimer);
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
  console.log(`Click, ${e.pointerType}, ${e.isPrimary}`);
  if (followingTarget || isAborted) {
    isAborted = false;
    return;
  }

  e.stopPropagation();
  if (inLongPress || isAborted) {
    inLongPress = false;
    longPressTarget = null;
    isAborted = false;
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

function abort() {
  if (longPressTarget) {
    longPressTarget.style.top = backup.top;
    longPressTarget.style.left = backup.left;
    inLongPress = false;
    longPressTarget = null;
    isAborted = true;
    console.log("Abort Long Press");
  } else if (followingTarget) {
    followingTarget.style.top = backup.top;
    followingTarget.style.left = backup.left;
    followingTarget = null;
    console.log("Abort Following");
  }
}
