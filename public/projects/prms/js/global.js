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

  if (window.location.pathname.includes("login.html")) {
    redirect = false;
  } else {
    const request = await apiHelper(`/api/folks/auth`);
    redirect = request.data ? false : true;
  }

  if (redirect) {
    window.location = "login.html";
  }
})();

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);
const dom = (element) => document.createElement(element);

const dateFormatter = (suppliedDate) => {
  const date = new Date(suppliedDate);

  const dateSettings = date.toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    // hour: "2-digit",
    // minute: "2-digit",
    // second: "2-digit",
    // timeZoneName: "short",
  });

  return dateSettings;
};
