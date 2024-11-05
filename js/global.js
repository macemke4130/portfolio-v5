const dom = new Map();
const allIdElements = document.querySelectorAll(`[id]`);
for (const element of allIdElements) dom.set(element.id, element);

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

dom.get("hamburger").addEventListener("click", handleHamburgerClick);
dom.get("close-navigation").addEventListener("click", handleCloseNavClick);
dom.get("navigation-curtain").addEventListener("click", handleCloseNavClick);