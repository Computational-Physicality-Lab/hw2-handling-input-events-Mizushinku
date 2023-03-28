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
var anchors = [];
var prevDiffX = -1;
var prevDiffY = -1;

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
  anchors.push(e);
  console.log("WS Down");
  if (followingTarget && e.pointerType == "touch") {
    if (e.isPrimary) {
      const [x, y] = checkPos(workspace, followingTarget, e);
      followingTarget.style.left = `${x}px`;
      followingTarget.style.top = `${y}px`;
    } else {
      abort();
      return;
    }
  }
  if (isScaling) {
    if (anchors.length >= 3) {
      abort();
    }
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
  removeAnchor(e);
  console.log("WS Up");
  longPressTarget = null;
  isAborted = false;
  if (followingTarget && e.pointerType == "touch") {
    const [x, y] = checkPos(workspace, followingTarget, e);
    followingTarget.style.left = `${x}px`;
    followingTarget.style.top = `${y}px`;
  }
  if (isScaling && anchors.length == 0) {
    isScaling = false;
    anchors = [];
    prevDiffX = -1;
    prevDiffY = -1;
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
  } else if (isScaling && anchors.length == 2) {
    console.log("On Scaling!");
    handleScaling(e);
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
    if (followingTarget || isScaling) {
      return;
    }
    e.stopPropagation();
    console.log(`Down, target = ${e.target.style.top}`);
    anchors.push(e);
    checkToScalingMode(e);

    if (!e.isPrimary) {
      if (!isScaling) {
        abort();
      }
      return;
    }
    longPress(e);
  });

  target.addEventListener("pointerup", (e) => {
    if (followingTarget || isScaling) {
      return;
    }
    e.stopPropagation();
    console.log(`Up, target = ${e.target.style.top}`);
    removeAnchor(e);
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
    } else {
      const gap = e.timeStamp - scalingTimestamp;
      if (gap < toScalingTolerance && focusedTarget) {
        console.log("Scaling Mode");
        isScaling = true;
        backup.width = focusedTarget.style.width;
        backup.height = focusedTarget.style.height;
      }
      scalingTimestamp = null;
    }
  }
}

function handleScaling(e) {
  const index = anchors.findIndex((anchor) => anchor.pointerId === e.pointerId);
  anchors[index] = e;
  const curDiffX = Math.abs(anchors[0].clientX - anchors[1].clientX);
  const curDiffY = Math.abs(anchors[0].clientY - anchors[1].clientY);
  if (curDiffX > curDiffY) {
    const s = Math.abs(curDiffX - prevDiffX);
    if (curDiffX > prevDiffX) {
      focusedTarget.style.width = `${
        parseInt(focusedTarget.style.width) + 1
      }px`;
    } else if (curDiffX < prevDiffX) {
      focusedTarget.style.width = `${Math.max(
        parseInt(focusedTarget.style.width) - 1,
        50
      )}px`;
    }
  } else {
    const s = Math.abs(curDiffY - prevDiffY);
    if (curDiffY > prevDiffY) {
      focusedTarget.style.height = `${
        parseInt(focusedTarget.style.height) + 1
      }px`;
    } else if (curDiffY < prevDiffY) {
      focusedTarget.style.height = `${Math.max(
        parseInt(focusedTarget.style.height) - 1,
        50
      )}px`;
    }
  }
  prevDiffX = curDiffX;
  prevDiffY = curDiffY;
}

function removeAnchor(e) {
  const index = anchors.findIndex((anchor) => anchor.pointerId === e.pointerId);
  anchors.splice(index, 1);
}

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
  } else if (isScaling) {
    console.log("Abort Scaling");
    isScaling = false;
    anchors = [];
    prevDiffX = -1;
    prevDiffY = -1;
    focusedTarget.style.width = backup.width;
    focusedTarget.style.height = backup.height;
  }
}
