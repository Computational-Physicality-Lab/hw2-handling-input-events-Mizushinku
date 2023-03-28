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

var doubleTapTimer = null;
var duringFirstTap = false;
var followingTarget = null;
var doubleTapLag = 350;

var scalingTimestamp = null;
var toScalingTolerance = 100;
var isScaling = false;
var touchCnt = 0;
var anchor_1 = null;
var anchor_2 = null;

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
  ++touchCnt;
  console.log("WS Down");
  if (followingTarget && e.pointerType == "touch") {
    if (e.isPrimary) {
      const [x, y] = checkPos(workspace, followingTarget, e);
      console.log(x, y);
      followingTarget.style.left = `${x}px`;
      followingTarget.style.top = `${y}px`;
    } else {
      abort();
      return;
    }
  }
  if (isScaling) {
    console.log(touchCnt);
  } else {
    checkToScalingMode(e);
  }

  if (longPressTarget && !e.isPrimary) {
    abort();
    return;
  }
  isWsDown = true;
});
workspace.addEventListener("pointerup", (e) => {
  --touchCnt;
  console.log("WS Up");
  longPressTarget = null;
  isAborted = false;
  if (followingTarget && e.pointerType == "touch") {
    const [x, y] = checkPos(workspace, followingTarget, e);
    followingTarget.style.left = `${x}px`;
    followingTarget.style.top = `${y}px`;
  }
  if (isScaling) {
    console.log(touchCnt);
  }
});
workspace.addEventListener("click", (e) => {
  if (isWsDown) {
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
    const [x, y] = checkPos(workspace, longPressTarget, e);
    longPressTarget.style.left = `${x}px`;
    longPressTarget.style.top = `${y}px`;
  } else if (e.isPrimary && followingTarget) {
    const [x, y] = checkPos(workspace, followingTarget, e);
    followingTarget.style.left = `${x}px`;
    followingTarget.style.top = `${y}px`;
  } else if (isScaling) {
    // console.log("Scaling!");
  }
});

function checkPos(parent, child, e) {
  const parentRect = parent.getBoundingClientRect();
  const childRect = child.getBoundingClientRect();

  let x = e.clientX - childRect.width / 2;
  let y = e.clientY - childRect.height / 2;

  x = Math.max(
    parentRect.left,
    Math.min(parentRect.right - childRect.width, x)
  );
  y = Math.max(
    parentRect.top,
    Math.min(parentRect.bottom - childRect.height, y)
  );
  x += childRect.width / 2;
  y += childRect.height / 2;

  return [x, y];
}

/*********************************/
/******* Targets Code Zone *******/
/*********************************/

const targets = document.querySelectorAll(".target");

targets.forEach((target) => {
  target.addEventListener("click", targetOnClick);
  target.addEventListener("dblclick", targetOnDoubleClick);

  target.addEventListener("pointerdown", (e) => {
    ++touchCnt;
    if (followingTarget || isScaling) {
      return;
    }
    e.stopPropagation();
    console.log(`Down, target = ${e.target.style.top}`);
    checkToScalingMode(e);

    if (!e.isPrimary) {
      abort();
      return;
    }
    longPress(e);
  });

  target.addEventListener("pointerup", (e) => {
    --touchCnt;
    if (followingTarget || isScaling) {
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
  if (followingTarget || isAborted || isScaling) {
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

function checkToScalingMode(e) {
  if (e.pointerType == "touch") {
    if (e.isPrimary) {
      scalingTimestamp = e.timeStamp;
      anchor_1 = e;
    } else {
      anchor_2 = e;
      const gap = e.timeStamp - scalingTimestamp;
      if (gap < toScalingTolerance) {
        console.log("Scaling Mode");
        isScaling = true;
      }
      scalingTimestamp = null;
      anchor_1 = null;
      anchor_2 = null;
    }
  }
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
