const url = new URL(window.location.href);
const params = new URLSearchParams(url.search);
const id = params.get("id");

const submitFactButton = $("#submit-fact");
const factListElement = $("#fact-list");

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

const handleSubmitFactClick = async () => {
  const data = {
    folks_id: folk.id,
    fact_title: $("#fact-title").value || "",
    fact_info: $("#fact-info").value,
  };

  const request = await apiHelper(`/api/folks/${id}/new-fact`, "POST", data);

  if (request.status === 200) {
    factListElement.innerHTML = "";
    $("#fact-title").value = "";
    $("#fact-info").value = "";
    $("#fact-title").focus();
    getFacts();
  }
};

const buildFactList = (lists) => {
  lists.titledFacts.forEach((fact) => {
    const liElement = dom("li");
    const bElement = dom("b");
    const spanElement = dom("span");

    bElement.textContent = fact.fact_title + ": ";
    spanElement.textContent = fact.fact_info;

    liElement.appendChild(bElement);
    liElement.appendChild(spanElement);
    factListElement.appendChild(liElement);
  });

  lists.nonTitledFacts.forEach((fact) => {
    const liElement = dom("li");

    liElement.textContent = fact.fact_info;

    factListElement.appendChild(liElement);
  });
};

const getFacts = async () => {
  const request = await apiHelper(`/api/folks/facts/${id}`);
  const response = request.data;

  const titledFacts = response.filter((fact) => !!fact.fact_title);
  const nonTitledFacts = response.filter((fact) => !fact.fact_title);

  buildFactList({ titledFacts, nonTitledFacts });
};

const handleFormSubmit = (event) => {
  event.preventDefault();
};

getFolk();
getFacts();

$("#new-fact").addEventListener("submit", handleFormSubmit);
submitFactButton.addEventListener("click", handleSubmitFactClick);
