const url = new URL(window.location.href);
const params = new URLSearchParams(url.search);
const id = params.get("id");

const getFolksAtHang = async (id) => {
  const request = await apiHelper(`/api/folks/at-hangs/${id}`);
  const response = request.data;

  populateFolksAtHangDOM(response);
};

const getHangDetails = async (id) => {
  const request = await apiHelper(`/api/folks/hangs/${id}`);
  const response = request.data[0];

  populateHangDetails(response);
};

const populateFolksAtHangDOM = (folks) => {
  const folksListElement = $("#hang-participants");

  folks.forEach((folk) => {
    const liElement = dom("li");
    const anchorElement = dom("a");

    anchorElement.setAttribute("href", `folk.html?id=${folk.id}`);
    anchorElement.textContent = folk.name;

    liElement.appendChild(anchorElement);
    folksListElement.appendChild(liElement);
  });
};

const populateHangDetails = (hang) => {
  $("h1").textContent = dateFormatter(hang.date);
  $("#hang-location").textContent = hang.location;
  $("#hang-details").textContent = hang.details;
};

getFolksAtHang(id);
getHangDetails(id);
