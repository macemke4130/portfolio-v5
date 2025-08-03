const submitFolkButton = $("#submit-folk");

const handleSubmitFolkButton = async () => {
  const data = {
    name: $("#folk-name").value,
  };

  const request = await apiHelper("/api/folks/new-folk", "POST", data);

  if (request.status === 200) {
    window.location = `./index.html`;
  }
};

const handleFormSubmit = (event) => {
  event.preventDefault();
};

$("#new-folk").addEventListener("submit", handleFormSubmit);
submitFolkButton.addEventListener("click", handleSubmitFolkButton);
