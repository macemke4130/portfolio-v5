console.log("Created by Lucas Mace");
console.log("lucasmace4130@gmail.com");

const bikeSerialInput = document.querySelector("#bike-serial-input");
const keySerialInput = document.querySelector("#key-serial-input");
const bikeBuilderInput = document.querySelector("#bike-builder-input");
const tiresInput = document.querySelector("#tires-input");
const dateInput = document.querySelector("#date-input");

const clearBuildersButton = document.querySelector("#clear-builders-button");
const builderListDiv = document.querySelector("#builder-list");

const bikeBuilderPreview = document.querySelector("#bike-builder-preview");
const datePreview = document.querySelector("#date-preview");
const tiresPreview = document.querySelector("#tires-preview");

const bikeSerialPreviewText = document.querySelector("#bike-serial-preview-text");
const keySerialPreviewText = document.querySelector("#key-serial-preview-text");

const bikeSerialPreviewBarcode = document.querySelector("#bike-serial-preview-barcode");
const keySerialPreviewBarcode = document.querySelector("#key-serial-preview-barcode");

const printButton = document.querySelector("#print-button");
const loadPrevious = document.querySelector("#load-previous-button");

const tireButtons = document.querySelectorAll("#tire-buttons button");

const generateBarcode = (event) => {
  const target = event.target;
  const barcodeValue = target.value;

  const isBike = target.id === "bike-serial-input";

  const previewBarcode = isBike ? bikeSerialPreviewBarcode : keySerialPreviewBarcode;
  const previewText = isBike ? bikeSerialPreviewText : keySerialPreviewText;

  if (barcodeValue) {
    JsBarcode(previewBarcode, barcodeValue, {
      format: "code128",
      lineColor: "#00",
      width: 1,
      height: 18,
      displayValue: false,
      margin: 0,
    });
    previewText.innerText = isBike ? barcodeValue : "Key: " + barcodeValue;
  } else {
    previewBarcode.style.height = 0;
    previewText.innerText = "";
  }
};

const bikeBuilder = (event) => {
  const builderName = event.target.value;

  if (builderName) {
    bikeBuilderPreview.textContent = `Built by ${builderName}`;
    renderDate();
  } else {
    bikeBuilderPreview.textContent = "";
  }
};

const renderDate = () => {
  const buildDate = dateInput.value;

  // User can delete values in #date-input so we check for validity.
  if (buildDate) {
    const theYear = buildDate.split("-")[0];
    const theMonth = buildDate.split("-")[1];
    const theDay = buildDate.split("-")[2];

    const buildDateOutput = `${theMonth}/${theDay}/${theYear}`;

    datePreview.innerText = buildDateOutput;
  } else {
    datePreview.innerText = "";
  }
};

const setDateInputToCurrentDate = () => {
  const rightNow = new Date(Date.now());
  const theYear = rightNow.getFullYear();
  const theMonth = rightNow.getMonth() + 1 < 10 ? `0${rightNow.getMonth() + 1}` : rightNow.getMonth() + 1;
  const theDay = rightNow.getDate() < 10 ? `0${rightNow.getDate()}` : rightNow.getDate();
  const theDate = `${theYear}-${theMonth}-${theDay}`;

  dateInput.value = theDate;
};

const validateForm = () => {
  const required = [bikeSerialInput, bikeBuilderInput, dateInput];
  const red = "3px solid red";
  const reset = "1px solid black";

  for (const input of required) {
    if (!input.value.trim()) {
      input.style.outline = red;
      input.focus();
      return false;
    } else {
      input.style.outline = reset;
    }
  }

  return true;
};

const checkBuilderListForName = (builderName) => {
  const builderList = localStorage.getItem("builderList");
  if (!builderList) return false;

  const builderArray = builderList.split(", ");
  const lowercaseBuilderArray = builderArray.map((builder) => builder.toLowerCase());
  const nameExists = lowercaseBuilderArray.includes(builderName.toLowerCase());
  return nameExists;
};

const handlePrint = () => {
  const formIsValid = validateForm();
  if (!formIsValid) return;

  // Preserve builderList for localStorage.clear();
  let builderList = localStorage.getItem("builderList");

  const nameExistsInBuilderList = checkBuilderListForName(bikeBuilderInput.value);
  if (!nameExistsInBuilderList) builderList = builderList + `, ${bikeBuilderInput.value}`;

  localStorage.clear();

  // Store local variables.
  localStorage.setItem("builderList", builderList);
  localStorage.setItem("bikeSerial", bikeSerialInput.value);
  localStorage.setItem("keySerial", !!keySerialInput.value ? keySerialInput.value : "null");
  localStorage.setItem("bikeBuilder", bikeBuilderInput.value);
  localStorage.setItem("date", dateInput.value);
  localStorage.setItem("tires", !!tiresPreview.innerText ? tiresPreview.innerText : "null");

  printIt();
};

const builderNameClick = (event) => {
  const target = event.target;
  const nameValue = target.innerText;

  // Just for fun.
  const fakeClickEvent = {
    target: { value: nameValue },
  };

  bikeBuilder(fakeClickEvent);
  bikeBuilderInput.value = nameValue;
};

const populateBuilderList = () => {
  const builderList = localStorage.getItem("builderList");
  if (!builderList) return;

  const builderArray = builderList.split(", ").filter((builder) => {
    if (!builder || builder === "null") return false;
    return true;
  });

  for (const builder of builderArray) {
    const nameButton = document.createElement("button");
    nameButton.innerText = builder;
    builderListDiv.appendChild(nameButton);
    nameButton.addEventListener("click", builderNameClick);
  }

  if (builderArray.length > 0) clearBuildersButton.style.display = "block";
};

const clearBuilders = () => {
  localStorage.removeItem("builderList");
  builderListDiv.style.display = "none";
  clearBuildersButton.style.display = "none";
};

const handleEnter = (event) => {
  if (event.key !== "Enter") return;
  requestAnimationFrame(() => handlePrint());
};

const handleTireClick = (event) => {
  const target = event.target;
  let tireValue = target.innerText;

  if (tireValue.toLowerCase() === "NON-TUBELESS BIKE".toLowerCase()) tireValue = "";

  tiresPreview.innerText = tireValue;
};

const printIt = () => {
  gtag("event", "print_serialized", {
    builder: bikeBuilderInput.value,
  });

  const stickerHTML = document.querySelector("#sticker-wrapper").innerHTML;

  const popupPrint = window.open("", "", "height=750, width=750");
  popupPrint.document.write(`<html><body>
      <style>
      body{ margin: 0; font-family: monospace; display: grid; place-items: center; }
  
      #sticker-preview {
      text-align: center;
      text-transform: uppercase;
      margin: 0 auto;
      width: 2.25in;
      height: 1.25in;
      display: flex;
      flex-direction: column;
      justify-content: space-evenly;
      }
  
      p { margin: 0; }
  
      p:empty { display:none; }
  
      .barcode-group {
        line-height: 0.8;
        margin: 0;
        padding: 0;
      }
  
      svg {
        display: block;
        margin: 0 auto;
      }
  
      svg:empty {
        display: none;
      }
      </style>
      ${stickerHTML}
      </body></html>`);

  popupPrint.document.close();
  popupPrint.print();

  // Close Popup
  setTimeout(() => {
    popupPrint.close();
    window.location.reload();
  }, 100);
};

populateBuilderList();
setDateInputToCurrentDate();

bikeSerialInput.addEventListener("keyup", generateBarcode);
keySerialInput.addEventListener("keyup", generateBarcode);
bikeBuilderInput.addEventListener("keyup", bikeBuilder);
clearBuildersButton.addEventListener("click", clearBuilders);
dateInput.addEventListener("change", renderDate);
printButton.addEventListener("click", handlePrint);
window.addEventListener("keydown", handleEnter);

for (const tire of tireButtons) {
  tire.addEventListener("click", handleTireClick);
}
