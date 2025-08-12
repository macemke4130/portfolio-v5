buildDOM = (hangList) => {
  hangList.forEach((hang) => {
    const container = dom("div");
    container.classList.add("hang-container");

    const h2 = dom("h2");
    h2.textContent = dateFormatter(hang.date);

    const p = dom("p");
    p.textContent = hang.details;

    const location = dom("div");
    location.classList.add("location");
    location.textContent = `Location: ${hang.location}`;

    const folks = dom("div");
    folks.classList.add("folks");
    hang.atHangs.forEach((folk) => {
      const anchor = dom("a");
      anchor.setAttribute("href", `folk.html?id=${folk.id}`);
      anchor.textContent = folk.name;
      folks.appendChild(anchor);
    });

    container.appendChild(h2);
    container.appendChild(folks);
    container.appendChild(p);
    container.appendChild(location);

    $("main").appendChild(container);
  });
};

const getAllHangs = async () => {
  const request = await apiHelper(`/api/folks/hangs`);
  const response = request.data;

  console.log(response);
  buildDOM(response);
};

getAllHangs();
