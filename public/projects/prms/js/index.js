const folksContainerElement = $(`#folks-list`);

const populateFolksSelectInput = async () => {
  const allFolks = await apiHelper("/api/folks");

  allFolks.data.forEach((folk) => {
    const liElement = dom("li");
    const anchorElement = dom("a");
    anchorElement.setAttribute("href", `folk.html?id=${folk.id}`);
    anchorElement.textContent = folk.name;

    liElement.appendChild(anchorElement);
    folksContainerElement.appendChild(liElement);
  });
};

populateFolksSelectInput();
