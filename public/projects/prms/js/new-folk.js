const submitFolkButton = $("#submit-folk");

const handleSubmitFolkButton = async () => {
  const data = {
    name: $("#folk-name").value,
  };

  await apiHelper("/api/folks/new-folk", "POST", data);
};

submitFolkButton.addEventListener("click", handleSubmitFolkButton);
