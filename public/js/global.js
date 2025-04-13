const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

// { type: "setInterval" | "setTimeout" | "listenerType", variable: any }
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

  renderMainContent(target.href);
  updateLocationBar(target.href);

  $("#site-content").scroll({
    top: 0,
    left: 0,
    behavior: "instant",
  });
};

const assignAnchorListeners = () => {
  const allAnchorElements = $$(`a:not(a[target="_blank"], [data-http])`);
  for (const element of allAnchorElements) element.addEventListener("click", anchorInturupt);
};

const handleHamburgerClick = (event) => {
  const target = event.currentTarget || event.target;
  const navIsOpen = target.getAttribute("aria-expanded") === "true";

  target.setAttribute("aria-label", `${navIsOpen ? "Open" : "Close"} navigation`);
  target.setAttribute("aria-expanded", !navIsOpen);
  $("#navigation-drawer").setAttribute("data-expanded", !navIsOpen);
  $("#navigation-curtain").setAttribute("data-position", navIsOpen ? "up" : "down");

  adjustTabIndexOfDrawerItems(navIsOpen);
};

// OMG fun. Javascript is wild.
const handleCloseNavClick = () => {
  const fakeEventObject = {
    target: $("#hamburger"),
  };
  handleHamburgerClick(fakeEventObject);
};

const adjustTabIndexOfDrawerItems = (navIsOpen) => {
  const allFocusableElements = $("#navigation-drawer").querySelectorAll(`a, button`);
  for (const element of allFocusableElements) element.setAttribute("tabindex", navIsOpen ? -1 : 0);
};

// Only needs to run once on initial page load.
const importComponents = async () => {
  const requestHeader = await fetch("./components/header.html");
  const requestHeaderText = await requestHeader.text();

  const siteHeaderId = "site-header";
  $(`#${siteHeaderId}`).innerHTML = requestHeaderText;

  setListeners();
  assignAnchorListeners();
};

const updateLocationBar = (url) => {
  history.pushState({ page: url }, "", url);
};

const renderMainContent = async (href) => {
  const requestHTMLDocument = await fetch(href);
  const htmlText = await requestHTMLDocument.text();

  const shadowRoot = document.createElement("html");
  shadowRoot.innerHTML = htmlText;

  const shadowMain = shadowRoot.querySelector("#main-grid");
  $("#main-grid").innerHTML = shadowMain.innerHTML;
  $("title").textContent = shadowRoot.querySelector("title").textContent;

  checkForScripts(shadowMain);

  const navOpen = $("#hamburger").getAttribute("aria-expanded") === "true";
  if (navOpen) handleCloseNavClick();
  assignAnchorListeners();

  // Google Analytics for SPAs.
  gtag("config", "G-01C8W76GX4", {
    page_path: href,
  });
};

const checkForScripts = (shadowMain) => {
  const allScriptTags = shadowMain.querySelectorAll("script");
  if (!allScriptTags.length) return;

  const domScriptTag = $("#main-grid").querySelector("script");

  (async () => {
    try {
      const importedScript = await import(domScriptTag.src);
      importedScript.runOnImport();
    } catch (error) {
      console.error(error);
    }
  })();
};

const setListeners = () => {
  $("#hamburger").addEventListener("click", handleHamburgerClick);
  $("#close-navigation").addEventListener("click", handleCloseNavClick);
  $("#navigation-curtain").addEventListener("click", handleCloseNavClick);
};

const handlePopstate = (event) => {
  const previousURL = new URL(event.state.page);
  anchorInturupt({ target: { href: previousURL.pathname }, preventDefault: () => null });
};

window.addEventListener("popstate", handlePopstate);

importComponents();
