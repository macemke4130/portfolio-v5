const dom = new Map();

const addElementsToDomMap = (parentElement = document.body) => {
  const allIdElements = parentElement.querySelectorAll(`[id]`);
  for (const element of allIdElements) dom.set(element.id, element);
};

addElementsToDomMap();

// Limits the frequency of function calls to 4 times
// per second rather than every mutation event.
let domThrottle = null;
const runDomMapThrottle = () => {
  if (domThrottle !== null) return;

  domThrottle = setTimeout(() => {
    addElementsToDomMap();
    assignAnchorListeners();

    domThrottle = null;
  }, 250);
};

const handleHamburgerClick = (event) => {
  const target = event.currentTarget || event.target;
  const navIsOpen = target.getAttribute("aria-expanded") === "true";

  target.setAttribute("aria-label", `${navIsOpen ? "Open" : "Close"} navigation`);
  target.setAttribute("aria-expanded", !navIsOpen);
  dom.get("navigation-drawer").setAttribute("aria-hidden", navIsOpen);
  dom.get("navigation-curtain").setAttribute("data-position", navIsOpen ? "up" : "down");

  adjustTabIndexOfDrawerItems(navIsOpen);
};

// OMG fun. Javascript is wild.
const handleCloseNavClick = () => {
  const fakeEventObject = {
    target: dom.get("hamburger"),
  };
  handleHamburgerClick(fakeEventObject);
};

const adjustTabIndexOfDrawerItems = (navIsOpen) => {
  const allFocusableElements = dom.get("navigation-drawer").querySelectorAll(`a, button`);
  for (const element of allFocusableElements) element.setAttribute("tabindex", navIsOpen ? -1 : 0);
};

// Only needs to run once on initial page load.
const importComponents = async () => {
  const requestHeader = await fetch("./components/header.html");
  const requestHeaderText = await requestHeader.text();

  const siteHeaderId = "site-header";
  dom.get(siteHeaderId).innerHTML = requestHeaderText;

  // Add newly imported components to dom map.
  addElementsToDomMap(dom.get(siteHeaderId));

  // Once added to dom map, set listeners.
  setListeners();
};

const anchorInturupt = (event) => {
  event.preventDefault();
  const target = event.target;

  renderMainContent(target.href);
};

const renderMainContent = async (href) => {
  const requestHTMLDocument = await fetch(href);
  const htmlText = await requestHTMLDocument.text();

  const shadowRoot = document.createElement("html");
  shadowRoot.innerHTML = htmlText;

  const shadowMain = shadowRoot.querySelector("#main-grid");
  dom.get("main-grid").innerHTML = shadowMain.innerHTML;

  handleCloseNavClick();
};

const assignAnchorListeners = () => {
  const allAnchorElements = document.querySelectorAll(`a:not(a[target="_blank"])`);
  for (const element of allAnchorElements) element.addEventListener("click", anchorInturupt);
};

const setListeners = () => {
  dom.get("hamburger").addEventListener("click", handleHamburgerClick);
  dom.get("close-navigation").addEventListener("click", handleCloseNavClick);
  dom.get("navigation-curtain").addEventListener("click", handleCloseNavClick);
};

const observer = new MutationObserver(runDomMapThrottle);
observer.observe(document.body, { attributes: false, childList: true, subtree: true });

importComponents();
