import { budData } from "./budData.js";

const request = window.indexedDB.open("fms", 1);

const handleSuccess = () => {};

const handleError = (event) => {
  console.error(event);
};

const handleUpgradeNeeded = (event) => {
  const db = event.target.result;

  const objectStore = db.createObjectStore("buds", { autoIncrement: true });

  objectStore.createIndex("name", "name", { unique: false });

  const handleCompleteTransaction = (event) => {
    console.log("Complete");
    const budObjectStore = db.transaction("buds", "readwrite").objectStore("buds");
    budData.forEach((bud) => {
      budObjectStore.add(bud);
    });
  };

  objectStore.transaction.addEventListener("complete", handleCompleteTransaction);
};

request.addEventListener("upgradeneeded", handleUpgradeNeeded);
// request.addEventListener("success", handleSuccess);
// request.addEventListener("error", handleError);
