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
const dom = (params) => {
  const element = document.createElement(params.tag || "div");

  if (params.attributes) {
    Object.entries(params.attributes).forEach((att) => {
      const [attribute, value] = att;
      element.setAttribute(attribute, value);
    });
  }

  if (params.text) {
    element.textContent = params.text;
  }

  return element;
};

const humanReadableDate = (timestamp) => {
  const date = new Date(timestamp);

  return new Intl.DateTimeFormat("en-US", {
    month: "numeric",
    day: "numeric",
    year: "numeric",
  }).format(date);
};

const formatDateForInput = (timestamp) => {
  const d = new Date(timestamp || Date.now());
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
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

// Gemini wrote this. Test later.
function wrapNumbersInSpan(elementSelector) {
  const container = document.querySelector(elementSelector);
  if (!container) return;

  const numberRegex = /(\d+)/g;

  // Helper function to process nodes recursively
  function processNode(node) {
    if (node.nodeType === 3) {
      const text = node.nodeValue;

      if (numberRegex.test(text)) {
        const tempContainer = document.createElement("div");
        // Wrap numbers with span tags
        tempContainer.innerHTML = text.replace(numberRegex, '<span class="num-highlight">$1</span>');

        // Replace the text node with the new HTML elements
        while (tempContainer.firstChild) {
          node.parentNode.insertBefore(tempContainer.firstChild, node);
        }
        node.parentNode.removeChild(node);
      }
    } else if (node.nodeType === 1) {
      // Node.ELEMENT_NODE === 1, recurse through children
      // We use Array.from because the childNodes list changes as we modify it
      Array.from(node.childNodes).forEach(processNode);
    }
  }

  processNode(container);

  // wrapNumbersInSpan('#my-target-div');
}

// This function was written by Gemini.
const rightNowDatabaseFormat = () => {
  const d = new Date(Date.now());
  const pad = (num) => String(num).padStart(2, "0");
  const date = [d.getFullYear(), pad(d.getMonth() + 1), pad(d.getDate())].join("-");
  const time = [pad(d.getHours()), pad(d.getMinutes()), pad(d.getSeconds())].join(":");
  return `${date} ${time}`;
};

const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const getDayOfWeek = () => new Date(Date.now()).getDay();

const addHoursToCurrentTime = (hours) => {
  const now = new Date();
  const msToAdd = hours * 60 * 60 * 1000;
  const dateInFuture = new Date(now.getTime() + msToAdd);
  const year = dateInFuture.getFullYear();
  const month = String(dateInFuture.getMonth() + 1).padStart(2, "0");
  const day = String(dateInFuture.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const getNextDayOfWeek = (targetDay) => {
  const today = new Date();
  const currentDay = today.getDay(); // 0-6

  // Calculate the difference in days
  // If the targetDay is today, this logic returns the occurrence 7 days from now.
  let daysUntilTarget = (targetDay - currentDay + 7) % 7;

  // Create the new date by adding the difference
  const nextOccurrence = new Date(today);
  nextOccurrence.setDate(today.getDate() + daysUntilTarget);

  // Format to YYYY-MM-DD
  const year = nextOccurrence.getFullYear();
  const month = String(nextOccurrence.getMonth() + 1).padStart(2, "0");
  const day = String(nextOccurrence.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const nullOrValue = (x) => {
  if (x === "null") return null;
  return x;
};
