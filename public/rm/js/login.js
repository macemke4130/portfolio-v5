const attemptLogin = async () => {
  const data = {
    emailAddress: $("#email-address").value,
    password: $("#password").value,
  };

  const request = await apiHelper(`/api/rm/login`, "POST", data);
  const response = request.data;

  useData(response);
};

const useData = (data) => {
  if (!data.login) return;

  localStorage.setItem("jwt", data.token);
  localStorage.setItem("rm-user", data.username);
  window.location = "index.html";
};

const handleFormSubmit = (event) => {
  event.preventDefault();
  attemptLogin();
};

$("#login-form").addEventListener("submit", handleFormSubmit);
