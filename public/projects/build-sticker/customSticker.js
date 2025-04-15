console.log("Created by Lucas Mace");
console.log("lucasmace4130@gmail.com");

const titleInput = document.querySelector("#title");
const bodyInput = document.querySelector("#body");
const titlePreview = document.querySelector("#title-preview");
const bodyPreview = document.querySelector("#body-preview");
const printButton = document.querySelector("#print-button");

const generate = () => {
  titlePreview.innerText = titleInput.value;
  bodyPreview.innerText = bodyInput.value;
};

const printIt = () => {
  gtag("event", "print_custom");

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
        justify-content: center;
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

        #title-preview {
          font-weight: bold;
          font-size: 1.25rem;
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

titleInput.addEventListener("keyup", generate);
bodyInput.addEventListener("keyup", generate);
printButton.addEventListener("click", printIt);
