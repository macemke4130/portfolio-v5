const isPublicPage = window.location.pathname.includes("login.html");

const apiHelper = async (path, method = "POST", data = { jwt: "" }) => {
  const headers = { "Content-Type": "application/json", Accept: "application/json" };
  const options = { method, headers };

  data.jwt = localStorage.getItem("jwt");

  const body = JSON.stringify(data);
  options.body = body;

  try {
    const request = await fetch(path, options);
    const response = await request.json();
    return response;
  } catch (error) {
    console.error(error);
    return null;
  }
};

(async () => {
  let redirect = true;

  if (isPublicPage) {
    redirect = false;
  } else {
    const request = await apiHelper(`/api/rm/auth`);
    redirect = request.data ? false : true;
  }

  if (redirect) {
    window.location = "login.html";
  }
})();

// Update Theme
(() => {
  if (!isPublicPage) {
    const userFromStorage = localStorage.getItem("rm-user");
    const user = userFromStorage.includes("risa") ? "Risa" : "Mace";
    document.documentElement.setAttribute("data-rm-user", user);
  }
})();

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);
const dom = (element) => document.createElement(element || "div");

const formatDate = (timestamp) => {
  const date = new Date(timestamp);

  return new Intl.DateTimeFormat("en-US", {
    month: "numeric",
    day: "numeric",
    year: "numeric",
  }).format(date);
};

const getUser = () => {
  const localUserEmail = localStorage.getItem("rm-user");
  return localUserEmail.includes("risa") ? "Risa" : "Mace";
};

const displayError = (error) => {
  console.error(error);
};

// Turn this off for production?
(() => {
  $$("input").forEach((input) => {
    input.setAttribute("autocomplete", "off");
  });
})();
