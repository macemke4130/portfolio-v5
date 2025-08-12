const url = new URL(window.location.href);
const params = new URLSearchParams(url.search);
const id = params.get("id");

const getHangDetails = async (id) => {
  const request = await apiHelper(`/api/folks/hangs/${id}`);
  const response = request.data[0];

  populateHangDetails(response);
};

const getFolksAtHang = async (id) => {
  const request = await apiHelper(`/api/folks/at-hangs/${id}`);
  const response = request.data;

  response.forEach((folk) => {
    $(`input[value="${folk.id}"]`).checked = true;
  });
};

const populateFolksListInputs = async () => {
  const allFolks = await apiHelper("/api/folks");
  const containerElement = $("#folks-list");

  allFolks.data.forEach((folk) => {
    const liElement = dom("li");
    const inputElement = dom("input");
    const labelElement = dom("label");

    inputElement.setAttribute("type", "checkbox");
    inputElement.setAttribute("id", `folk-id-${folk.id}`);
    inputElement.setAttribute("value", folk.id);

    labelElement.setAttribute("for", `folk-id-${folk.id}`);
    labelElement.textContent = folk.name;

    liElement.appendChild(labelElement);
    liElement.appendChild(inputElement);
    containerElement.appendChild(liElement);
  });

  getFolksAtHang(id);
  getHangDetails(id);
};

const populateFolksAtHangDOM = (folks) => {
  const folksListElement = $("#folks-list");

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
  $("#hang-date").value = hang.date.split("T")[0];
  $("#hang-location").value = hang.location;
  $("#hang-details").value = hang.details;
};

populateFolksListInputs();

const wipeFolksAtHangRows = async () => {
  const request = await apiHelper(`/api/folks/hangs/${id}/delete-folks/`);
  return request.status === 200;
};

const addFolksToHang = async () => {
  const data = {
    folks: [...$$(`#folks-list input:checked`)].map((folk) => Number(folk.getAttribute("value"))),
  };

  await apiHelper(`/api/folks/hangs/${id}/add-folks/`, "POST", data);
};

const submitHangDetails = async () => {
  const data = {
    date: $("#hang-date").value + " 12:00:00",
    location: $("#hang-location").value,
    details: $("#hang-details").value,
  };

  const request = await apiHelper(`/api/folks/hangs/${id}/update/`, "POST", data);
  if (request.status === 200) {
    window.location = `hang.html?id=${id}`;
  } else {
    alert(request.sql);
  }
};

const handleFormSubmit = async (event) => {
  event.preventDefault();

  const wipeRowsResponse = await wipeFolksAtHangRows(id);

  if (wipeRowsResponse) {
    addFolksToHang();
    submitHangDetails();
  }
};

$("#edit-hang").addEventListener("submit", handleFormSubmit);
