const openLinksButton = document.querySelector("#open-selected");

const handleOpenSelectedClick = () => {
  const allSelectedLinks = document.querySelectorAll(`li:has(input:checked) a`);

  allSelectedLinks.forEach((link) => {
    window.open(link.getAttribute("href"), "_blank");
  });
};

openLinksButton.addEventListener("click", handleOpenSelectedClick);
