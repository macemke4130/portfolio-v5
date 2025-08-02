const submitHangButton = $("#submit-hang");

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
};

const handleSubmitHangClick = async () => {
  const allInputs = [...$$("#folks-list input")];
  const allCheckedInputs = allInputs.filter((input) => input.checked);
  const folksAtHang = allCheckedInputs.map((input) => Number(input.getAttribute("value")));

  const details = $("#hang-details").value;

  const data = {
    folksAtHang,
    details,
    location: $("#location").value,
  };

  const request = await apiHelper("/api/folks/new-hang", "POST", data);
};

populateFolksListInputs();

submitHangButton.addEventListener("click", handleSubmitHangClick);
