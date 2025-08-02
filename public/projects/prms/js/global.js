const root = "https://www.lucasmace.com";

const apiHelper = async (path, method = "GET", data) => {
  const headers = { "Content-Type": "application/json", Accept: "application/json" };
  const options = { method, headers };

  if (data) {
    const body = JSON.stringify(data);
    options.body = body;
  }

  try {
    const request = await fetch(`${root}${path}`, options);
    const response = await request.json();
    return response;
  } catch (error) {
    console.error(error);
    return null;
  }
};

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
