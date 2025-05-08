import { budData } from "./budData.js";

const request = window.indexedDB.open("fms", 1);
let db;

const handleSuccess = (event) => {
  db = event.target.result;
};

const handleError = (event) => {
  console.error(event);
};

const handleUpgradeNeeded = (event) => {
  db = event.target.result;

  const objectStore = db.createObjectStore("buds", { autoIncrement: true });

  objectStore.createIndex("name", "name", { unique: false });

  const handleCompleteTransaction = (event) => {
    const budObjectStore = db.transaction("buds", "readwrite").objectStore("buds");
    budData.forEach((bud) => {
      budObjectStore.add(bud);
    });
  };

  objectStore.transaction.addEventListener("complete", handleCompleteTransaction);
};

const getBud = () => {
  const transaction = db.transaction(["buds"]);
  const objectStore = transaction.objectStore("buds");
  const request = objectStore.get("Sarah Everson");

  request.onerror = (event) => {
    console.error(event);
  };

  request.onsuccess = (event) => {
    // Do something with the request.result!
    console.log(request);
  };
};

request.addEventListener("upgradeneeded", handleUpgradeNeeded);
request.addEventListener("success", handleSuccess);
request.addEventListener("error", handleError);

document.querySelector("button").addEventListener("click", () => {
  getBud();
});
