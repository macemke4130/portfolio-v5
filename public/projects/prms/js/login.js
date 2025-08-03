const attemptLogin = async () => {
  const data = {
    emailAddress: $("#email-address").value,
    password: $("#password").value,
  };

  const request = await apiHelper(`/api/folks/login`, "POST", data);
  const response = request.data;

  useData(response);
};

const useData = (data) => {
  if (!data.login) return;

  localStorage.setItem("jwt", data.token);
  window.location = "index.html";
};

const handleFormSubmit = (event) => {
  event.preventDefault();
  attemptLogin();
};

$("#login").addEventListener("submit", handleFormSubmit);
