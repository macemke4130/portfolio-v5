const url = new URL(window.location.href);
const params = new URLSearchParams(url.search);
const id = params.get("id");

const folk = {
  id: -1,
  name: "",
};

const buildHangsDOM = (hangs) => {
  const hangsList = $("#hangs-list");

  hangs.forEach((hang) => {
    const liElement = dom("li");
    const anchorElement = dom("a");

    anchorElement.setAttribute("href", `hang.html?id=${hang.hangs_id}`);
    anchorElement.textContent = dateFormatter(hang.date);

    liElement.appendChild(anchorElement);
    hangsList.appendChild(liElement);
  });
};

const getFolk = async () => {
  const request = await apiHelper(`/api/folks/${id}`);
  const response = request.data[0];

  (folk.id = response.id), (folk.name = response.name);
  setupPage();
  getHangs();
};

const getHangs = async () => {
  const request = await apiHelper(`/api/folks/${id}/hangs/`);
  const response = request.data;

  buildHangsDOM(response);
};

const setupPage = () => {
  $("h1").textContent = folk.name;
};

getFolk();
