const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

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

const importComponents = async () => {
  const requestHeader = await fetch("./components/header.html");
  const requestHeaderText = await requestHeader.text();

  const siteHeaderId = "site-header";
  $(`#${siteHeaderId}`).innerHTML = requestHeaderText;

  setListeners();
};

const setListeners = () => {
  $("#hamburger").addEventListener("click", handleHamburgerClick);
  $("#close-navigation").addEventListener("click", handleCloseNavClick);
  $("#navigation-curtain").addEventListener("click", handleCloseNavClick);
};

importComponents();
