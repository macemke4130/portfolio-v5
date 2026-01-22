const updateGreeting = () => {
  if (getUser() === "Mace") {
    $("#greeting").textContent = "You are Mace";
    return;
  }

  if (getUser() === "Risa") {
    $("#greeting").textContent = "Hi Risa! You're cute and people like you.";
  }
};

const getShoppingList = async () => {
  try {
    const request = await apiHelper(`/api/rm/shopping-list`, "POST");
    return request.data;
  } catch (error) {
    displayError(error);
  }
};

const handleShoppingListEditButtonClick = (event) => {
  alert("This doesn't work yet. Chill.");
};

const handleShoppingItemCheckboxChange = () => {
  const allShoppingListCheckboxes = $$("#shopping-list input.got");
  const showShoppingListOptionsMenu = [...allShoppingListCheckboxes].some((input) => input.checked);

  if (showShoppingListOptionsMenu) {
    $("#shopping-list-options").classList.remove("display-none");
  } else {
    $("#shopping-list-options").classList.add("display-none");
  }
};

const removeItemsFromShoppingList = async (completeItemIds) => {
  const data = {
    got_by: getUser(),
    date_complete: rightNowDatabaseFormat(),
    completeItemIds,
  };

  const request = await apiHelper(`/api/rm/shopping-list/remove`, "POST", data);

  if (request.status === 200) {
    // change to wipe div and refetch.
    window.location.reload();
  }
};

const handleMarkSelectedAsDoneClick = () => {
  const allCheckedShoppingListItems = $$("#shopping-list input.got:checked");
  const shoppingListIdsToComplete = [...allCheckedShoppingListItems].map((input) => {
    const containerLiElement = input.closest(`[data-item-id]`);
    return Number(containerLiElement.getAttribute("data-item-id"));
  });

  removeItemsFromShoppingList(shoppingListIdsToComplete);
};

const buildShoppingList = (data) => {
  const shoppingListElement = $("#shopping-list");

  data.forEach((li) => {
    const liElement = dom({
      tag: "li",
      attributes: {
        class: li.priority > 0 ? "high-priority" : "",
        "data-item-id": li.id,
      },
    });

    const liInfo = dom({ attributes: { class: "info" } });

    const liControls = dom({ attributes: { class: "controls" } });

    const itemNameElement = dom({
      attributes: {
        class: "item-name",
      },
      text: li.item_name,
    });
    liInfo.appendChild(itemNameElement);

    const addedByElement = dom({
      attributes: {
        class: "added-by",
      },
      text: `Added by ${li.added_by} ${humanReadableDate(li.date_added)}`,
    });
    liInfo.appendChild(addedByElement);

    const notesElement = dom({
      tag: "p",
      attributes: {
        class: "notes",
      },
      text: li.notes,
    });
    liInfo.appendChild(notesElement);

    const checkboxLabel = dom({ tag: "label" });

    const checkboxElement = dom({
      tag: "input",
      attributes: {
        class: "got",
        type: "checkbox",
      },
    });

    checkboxLabel.appendChild(checkboxElement);
    checkboxElement.addEventListener("input", handleShoppingItemCheckboxChange);
    liControls.appendChild(checkboxLabel);

    const editButton = dom({ tag: "button", attributes: { class: "edit" } });
    editButton.addEventListener("click", handleShoppingListEditButtonClick);

    const editButtonImage = dom({
      tag: "img",
      attributes: {
        src: "./images/edit-pencil.svg",
        width: "20",
        height: "20",
      },
    });
    editButton.appendChild(editButtonImage);

    liControls.appendChild(editButton);
    liElement.appendChild(liInfo);
    liElement.appendChild(liControls);
    shoppingListElement.appendChild(liElement);
  });
};

const handleFinishChoreButton = (event) => {
  const target = event.target;
};

const buildChoreList = (data) => {
  data.forEach((chore) => {
    const liElement = dom({
      tag: "li",
      attributes: {
        class: "chore-item",
        "data-chore-id": chore.id,
      },
    });

    const liInfo = dom({ attributes: { class: "info" } });

    const itemName = dom({
      attributes: {
        class: "item-name",
      },
      text: chore.chore_name,
    });
    liInfo.appendChild(itemName);

    const dueBy = dom({ attributes: { class: "due-by" }, text: humanReadableDate(chore.date_due) });
    liInfo.appendChild(dueBy);

    const points = dom({ attributes: { class: "points" }, text: `${chore.points} points` });
    liInfo.appendChild(points);

    if (chore.notes) {
      const notes = dom({ tag: "p", attributes: { class: "notes" }, text: chore.notes });
      liInfo.appendChild(notes);
    }

    const controls = dom({ attributes: { class: "controls" } });

    const doneButton = dom({
      tag: "button",
      attributes: {
        class: "complete",
        type: "button",
      },
      text: "Finished",
    });
    doneButton.addEventListener("click", handleFinishChoreButton);
    controls.appendChild(doneButton);

    liElement.appendChild(liInfo);
    liElement.appendChild(controls);

    $("#todays-chores-list").appendChild(liElement);
  });
};

const gatherData = async () => {
  const shoppingList = await getShoppingList();
  buildShoppingList(shoppingList);

  const chores = await getChores();
  buildChoreList(chores);
};

const addItemToShoppingList = async () => {
  const shoppingItem = {
    item_name: $("#new-item-title").value,
    quantity: $("#new-item-quantity").value,
    notes: $("#new-item-notes").value,
    priority: $(`[name="new-item-priority"]:checked`).value,
    date_added: rightNowDatabaseFormat(),
    added_by: getUser(),
  };

  const request = await apiHelper(`/api/rm/shopping-list/add`, "POST", shoppingItem);

  if (request.status === 200) {
    // change to wipe div and refetch.
    window.location.reload();
  }
};

const getChores = async () => {
  try {
    const request = await apiHelper(`/api/rm/chores`);
    return request.data;
  } catch (error) {
    displayError(error);
  }
};

const calculateChoreDueDate = () => {
  const repeatsEveryHours = Number($("#new-chore-repeats-hours").value);
  const repeatsEveryWeekday = Number($("#new-chore-day-of-week").value);
  const isOneTimeChore = $("#new-chore-repeats-hours").value === "0";

  if (isOneTimeChore) {
    return $("#new-chore-due-date").value;
  }

  if (repeatsEveryHours === 168) {
    // Is a chore that repeats on a specific day of week.
    return getNextDayOfWeek(repeatsEveryWeekday);
  }

  // Is a chore that repeats on an hourly basis.
  return addHoursToCurrentTime(repeatsEveryHours);
};

const addNewChore = async (event) => {
  event.preventDefault();

  const chore = {
    chore_name: $("#new-chore-title").value,
    repeats_every_hours: $("#new-chore-day-of-week").value === "-1" ? $("#new-chore-repeats-hours").value : null,
    repeats_day_of_week: $("#new-chore-day-of-week").value === "-1" ? null : $("#new-chore-day-of-week").value,
    date_due: calculateChoreDueDate(),
    notes: $("#new-chore-notes").value,
    points: $("#new-chore-points").value,
    date_added: rightNowDatabaseFormat(),
    added_by: getUser(),
  };

  const request = await apiHelper(`/api/rm/chores/add`, "POST", chore);

  if (request.status === 200) {
    $("#todays-chores-list").innerHTML = "";

    const chores = await getChores();
    buildChoreList(chores);
  }
};

const handleChoreRepeatChange = (event) => {
  const target = event.currentTarget;

  switch (Number(target.value)) {
    // Does not repeat
    case 0: {
      $(`[for="new-chore-due-date"]`).classList.remove("display-none");
      $("#new-chore-due-date").classList.remove("display-none");
      // Reset day of week.
      $("#new-chore-day-of-week").value = "-1";
      $(`[for="new-chore-day-of-week"`).classList.add("display-none");
      $("#new-chore-day-of-week").classList.add("display-none");
      break;
    }

    // Once a week
    case 168: {
      $(`[for="new-chore-day-of-week"`).classList.remove("display-none");
      $("#new-chore-day-of-week").classList.remove("display-none");
      $(`[for="new-chore-due-date"]`).classList.add("display-none");
      $("#new-chore-due-date").classList.add("display-none");
      break;
    }

    default: {
      $(`[for="new-chore-due-date"]`).classList.add("display-none");
      $("#new-chore-due-date").classList.add("display-none");
      // Reset day of week.
      $("#new-chore-day-of-week").value = "-1";
      $(`[for="new-chore-day-of-week"`).classList.add("display-none");
      $("#new-chore-day-of-week").classList.add("display-none");
      break;
    }
  }
};

const twoDaysInMS = 60 * 60 * 48 * 1000;
$("#new-chore-due-date").value = formatDateForInput(Date.now() + twoDaysInMS);

$("#new-chore-repeats-hours").addEventListener("input", handleChoreRepeatChange);
$("#add-item-button").addEventListener("click", addItemToShoppingList);
$("#new-chore-form").addEventListener("submit", addNewChore);
$("#mark-selected-as-done-button").addEventListener("click", handleMarkSelectedAsDoneClick);

updateGreeting();
gatherData();
