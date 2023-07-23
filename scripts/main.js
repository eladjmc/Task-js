const IMAGE_SIZE = 100;
const AMOUNT_OF_ALLOCATION_ATTEMPTS = 1000;
let container = null;
let images = [];
let focusedImage = null;

const handleAddClick = () => {
  document.getElementById("img-picker").click();
};

const imageSpotAllocation = (img) => {
  // Self reminder: The Element.getBoundingClientRect() method returns a DOMRect object providing information about the size of an element and its position relative to the viewport.
  const { width, height } = container.getBoundingClientRect();
  const attempts = AMOUNT_OF_ALLOCATION_ATTEMPTS; // number of attempts to find a non-colliding spot

  for (let i = 0; i < attempts; i++) {
    let left = Math.floor(Math.random() * (width - IMAGE_SIZE));
    let top = Math.floor(Math.random() * (height - IMAGE_SIZE));

    left = left - (left % 10); // If the placement is on 12 and I move 10px each time the image will have a distance of 8px(!) from the other "solid" element 
    top = top - (top % 10);

    if (!collision(left, top, IMAGE_SIZE, IMAGE_SIZE)) {
      img.style.left = left + "px";
      img.style.top = top + "px";
      img.addEventListener("click", function () {
        if(focusedImage){
            focusedImage.classList.remove('selected-image');
        }
        focusedImage = this;
        focusedImage.classList.add('selected-image');

      });

      container.appendChild(img);
      images.push(img);
      return;
    }
  }

  alert("There is no more space on the board."); // this alert is in case there are ~83270502397(too many) images already
};

const renderImage = (e) => {
  const fileReader = e.target;
  const img = document.createElement("img");
  img.src = fileReader.result;
  img.className = "image-item";
  imageSpotAllocation(img);
  img.click();
};

const loadFile = (e) => {
  let file = e.target.files[0];
  if (!file) {
    return;
  }
  let reader = new FileReader();
  reader.onloadend = renderImage; // this will run after the file is loaded.

  // The readAsDataURL method is used to read the contents of the specified Blob or File. When the read operation is finished,
  // the readyState becomes DONE, and the loadend is triggered. At that time, the result attribute contains the data as a data: URL
  // representing the file's data as a base64 encoded string.
  reader.readAsDataURL(file);
};

const moveImage = (e) => {
  if (focusedImage) {
    let x = parseInt(focusedImage.style.left);
    let y = parseInt(focusedImage.style.top);
    let width = focusedImage.offsetWidth;
    let height = focusedImage.offsetHeight;
    let newLeft = x;
    let newTop = y;

    switch (e.key) {
      case "ArrowLeft":
        newLeft = Math.max(0, x - 10);
        break;
      case "ArrowRight":
        newLeft = Math.min(container.offsetWidth - width, x + 10);
        break;
      case "ArrowUp":
        newTop = Math.max(0, y - 10);
        break;
      case "ArrowDown":
        newTop = Math.min(container.offsetHeight - height, y + 10);
        break;
    }

    // Check for a collision before updating position
    if (!collision(newLeft, newTop, width, height, focusedImage)) {
      focusedImage.style.left = newLeft + "px";
      focusedImage.style.top = newTop + "px";
    }
  }
};

const createRect = (x, y, width, height) => {
  return { x, y, width, height };
};

const isCollided = (rect1, rect2) => {
  return (
    rect1.x < rect2.x + rect2.width &&
    rect1.x + rect1.width > rect2.x &&
    rect1.y < rect2.y + rect2.height &&
    rect1.y + rect1.height > rect2.y
  );
};

const collision = (newLeft, newTop, width, height, movingImage) => {
  const rect1 = createRect(newLeft, newTop, width, height);

  for (let image of images) {
    // exclude the moving character from collision check
    if (image === movingImage) continue;

    const rect2 = createRect(
      parseInt(image.style.left),
      parseInt(image.style.top),
      image.offsetWidth,
      image.offsetHeight
    );

    if (isCollided(rect1, rect2)) {
      return true;
    }
  }

  return false;
};

const registerContainer = () => {
  container = document.getElementById("game-container");
};

const registerEvents = () => {
  document.getElementById("img-picker").addEventListener("change", loadFile);
  window.addEventListener("keydown", moveImage);
};

const init = () => {
  registerContainer();
  registerEvents();
};

init();
