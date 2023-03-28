// NOTE: The variable "shirts" is defined in the shirts.js file as the full list of shirt offerings
//       You can access this variable here, and should use this variable here to build your webpages

function elementFromHtml(html) {
  const template = document.createElement("template");
  template.innerHTML = html.trim();
  return template.content.firstElementChild;
}

function init_show_pic(info) {
  const n_color = info.colors ? Object.keys(info.colors).length : 0;
  const colors = n_color ? info.colors : info.default;

  let show_pic = undefined;
  if (n_color) {
    for (const c in colors) {
      show_pic = colors[c].front ? colors[c].front : undefined;
      if (show_pic) break;
      show_pic = colors[c].back ? colors[c].back : undefined;
      if (show_pic) break;
    }
  } else {
    //default color
    show_pic = colors ? colors.front : "";
  }

  //Check show_pic(url string) exist in the DB.
  let xhr = new XMLHttpRequest();
  xhr.open("HEAD", show_pic, false);
  xhr.send();
  if (xhr.status == "404" || !show_pic) {
    show_pic = "./shirt_images/not-found.png";
  }

  return show_pic;
}

function change_detail_img(info) {
  const side = sessionStorage.getItem("detail-btn-side-clicked");
  const color = sessionStorage.getItem("detail-btn-color-clicked");
  let pic = "";
  if ("colors" in info && color in info.colors && side in info.colors[color]) {
    pic = info.colors[color][side];
  } else if ("default" in info && side in info.default) {
    pic = info.default[side];
  }
  let xhr = new XMLHttpRequest();
  xhr.open("HEAD", pic, false);
  xhr.send();
  if (xhr.status == "404" || !pic) {
    pic = "./shirt_images/not-found.png";
  }
  document.getElementById("detail-prod-img").src = pic;
}

let initProducts = () => {
  // To see the shirts object, run:
  // console.log(shirts);
  // Your Code Here
  const grid = document.getElementById("grid-product");
  shirts.forEach((info, i_prod) => {
    //Check for data lost
    const name = info.name ? info.name : "(Data Lost)";
    const n_color = info.colors ? Object.keys(info.colors).length : 0;
    const link_to_detail = `./details.html?p=${i_prod}`;
    show_pic = init_show_pic(info);

    const item = elementFromHtml(`
      <div class="grid-product-item">
        <a href="${link_to_detail}" class="product-shirt-link">
          <img src="${show_pic}" alt="" class="product-shirt-img">
        </a>
        <p class="product-shirt-name">${name}<p>
        <p class="product-shirt-ava-color">
          Available in ${n_color} colors
        </p>
        <a href="${link_to_detail}" class="link-to-detail">See Page</a>
      </div>
    `);
    grid.appendChild(item);
  });
};

let initDetails = () => {
  // To see the shirts object, run:
  // console.log(shirts);
  // Your Code Here
  const urlParams = new URLSearchParams(window.location.search);
  const idx_prod = urlParams.get("p");

  prod = shirts[idx_prod];
  const name = prod.name ? prod.name : "(Data Lost)";
  const desc = prod.description ? prod.description : "(Data Lost)";
  const price = prod.price ? prod.price : "(Data Lost)";

  document.getElementById("detail-prod-name").innerHTML = name;
  document.getElementById("info-price").innerHTML = price;
  document.getElementById("info-desc").innerHTML = desc;

  document.getElementById("detail-prod-img").src = init_show_pic(prod);

  sessionStorage.setItem("detail-btn-side-clicked", "front");

  if ("colors" in prod) {
    const color_btns = document.getElementById("detail-color-btns-list");
    let is_color_set = false;
    for (c in prod.colors) {
      if (!is_color_set) {
        sessionStorage.setItem("detail-btn-color-clicked", c);
        is_color_set = true;
      }
      let btn = document.createElement("button");
      btn.innerHTML = c;
      btn.style.background = c;
      btn.myColor = c;
      btn.addEventListener("click", () => {
        sessionStorage.setItem("detail-btn-color-clicked", btn.myColor);
        change_detail_img(prod);
      });
      color_btns.appendChild(btn);
    }
  }

  document.getElementById("btn-front").addEventListener("click", () => {
    sessionStorage.setItem("detail-btn-side-clicked", "front");
    change_detail_img(prod);
  });
  document.getElementById("btn-back").addEventListener("click", () => {
    sessionStorage.setItem("detail-btn-side-clicked", "back");
    change_detail_img(prod);
  });
};
