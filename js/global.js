// {
// type: "setInterval" | "setTimeout" | "listenerType",
// variable: any
// }
const cleanupList = [];

const cleanup = (index) => {
  const job = cleanupList[index];
  const cleanupType = job.type;
  const variable = job.variable;

  switch (cleanupType) {
    case "setInterval": {
      clearInterval(variable);
      break;
    }

    case "setTimeout": {
      clearTimeout(variable);
      break;
    }

    default: {
      window.removeEventListener(cleanupType, variable);
      break;
    }
  }
};

const clearCleanupList = () => {
  for (let index = 0; index < cleanupList.length; index++) {
    cleanup(index);
  }
  cleanupList.length = 0;
};

const anchorInturupt = (event) => {
  event.preventDefault();
  const target = event.target;

  clearCleanupList();
  console.log(cleanupList);

  renderMainContent(target.href);
};

const assignAnchorListeners = () => {
  const allAnchorElements = document.querySelectorAll(`a:not(a[target="_blank"])`);
  for (const element of allAnchorElements) element.addEventListener("click", anchorInturupt);
};

const dom = new Map();

const resetDomMap = () => {
  dom.clear();

  const allIdElements = document.body.querySelectorAll(`[id]`);
  for (const element of allIdElements) dom.set(element.id, element);
  assignAnchorListeners();
};

resetDomMap();

// Limits the frequency of function calls to 4 times
// per second rather than every mutation event.
let domThrottle = null;
const domMapThrottle = () => {
  if (domThrottle !== null) return;

  domThrottle = setTimeout(() => {
    resetDomMap();
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
  resetDomMap();

  // Once added to dom map, set listeners.
  setListeners();
};

const renderMainContent = async (href) => {
  const requestHTMLDocument = await fetch(href);
  const htmlText = await requestHTMLDocument.text();

  const shadowRoot = document.createElement("html");
  shadowRoot.innerHTML = htmlText;

  const shadowMain = shadowRoot.querySelector("#main-grid");
  dom.get("main-grid").innerHTML = shadowMain.innerHTML;

  checkForScripts(shadowMain);

  const navOpen = dom.get("hamburger").getAttribute("aria-expanded") === "true";
  if (navOpen) handleCloseNavClick();
};

const checkForScripts = (shadowMain) => {
  const allScriptTags = shadowMain.querySelectorAll("script");
  if (!allScriptTags.length) return;

  const domScriptTags = dom.get("main-grid").querySelectorAll("script");

  (async () => {
    try {
      const importedScript = await import(domScriptTags[0].src);
      importedScript.testing();
      console.log("imported");
    } catch (error) {
      console.error(error);
    }
  })();

  for (const script of allScriptTags) {
    const source = script.src;
  }
};

const setListeners = () => {
  dom.get("hamburger").addEventListener("click", handleHamburgerClick);
  dom.get("close-navigation").addEventListener("click", handleCloseNavClick);
  dom.get("navigation-curtain").addEventListener("click", handleCloseNavClick);
};

// const observer = new MutationObserver(domMapThrottle);
// observer.observe(document.body, { attributes: false, childList: true, subtree: true });

importComponents();
