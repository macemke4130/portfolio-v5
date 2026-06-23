const allListItems = document.querySelectorAll("li");

const handleListItemClick = (event) => {
  const target = event.target;
  target.classList.toggle("strike");
};

allListItems.forEach((item) => {
  item.addEventListener("click", handleListItemClick);
});
