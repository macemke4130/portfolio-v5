import express from "express";
import { query, apiRoute, prepData } from "./dbConnect.js";
import config from "./config/index.js";

import * as jsonwebtoken from "jsonwebtoken";

const privateKey = config.keys.jwt;

const router = express.Router();

const authorize = async (tokenFromFrontEnd) => {
  let authorized = false;

  await jsonwebtoken.default.verify(tokenFromFrontEnd, privateKey, function (err, decoded) {
    authorized = err ? false : true;
  });

  return authorized;
};

const unauthorizedResponse = {
  message: "Unauthorized",
  status: 401,
  data: null,
};

router.get(`${apiRoute}/greet/`, async (req, res) => {
  const response = {
    message: "Greeting.",
    status: 200,
    data: "Hello, Mace!",
  };

  res.json(response);
});

router.post(`${apiRoute}/rm/login`, async (req, res) => {
  const loginData = req.body;

  let response = {};

  try {
    const sql = await query(`SELECT password FROM users WHERE email_address = "${loginData.emailAddress}"`);

    // Email address not found.
    if (!sql.length) {
      response = {
        message: `Login failed.`,
        status: 200,
        data: { login: false },
      };

      res.json(response);
      return;
    }

    const passwordFromDatabase = sql[0].password;
    const loginSuccess = loginData.password === passwordFromDatabase;

    if (loginSuccess) {
      const dataForToken = {
        emailAddress: loginData.emailAddress,
      };

      const token = await jsonwebtoken.default.sign({ data: dataForToken }, privateKey, { expiresIn: "1Y" });

      response = {
        message: `Login Success and JSON Web Token.`,
        status: 200,
        data: { login: true, token, username: loginData.emailAddress },
      };
    } else {
      response = {
        message: `Login failed.`,
        status: 200,
        data: { login: false },
      };
    }

    res.json(response);
  } catch (e) {
    response = {
      message: `Login failed.`,
      status: 200,
      data: { login: false },
    };

    res.json(response);
    console.log(e);
  }
});

router.post(`${apiRoute}/rm/auth`, async (req, res) => {
  const authorized = await authorize(req.body.jwt);

  if (authorized) {
    res.json({
      message: "Authorized",
      status: 200,
      data: { login: true },
    });
  } else {
    res.json(unauthorizedResponse);
  }
});

router.post(`${apiRoute}/rm/shopping-list/`, async (req, res) => {
  const isValidJWT = await authorize(req.body.jwt);

  if (!isValidJWT) {
    res.json(unauthorizedResponse);
    return;
  }

  try {
    const sql = await query(`SELECT * FROM shopping_list WHERE got_by IS NULL ORDER BY priority DESC, date_added`);

    const response = {
      message: "Shopping List.",
      status: 200,
      data: sql,
    };

    res.json(response);
  } catch (e) {
    const response = {
      message: e.sqlMessage,
      status: e.errno,
      data: null,
    };

    res.json(response);
    console.log(e);
  }
});

router.post(`${apiRoute}/rm/shopping-list/add`, async (req, res) => {
  const isValidJWT = await authorize(req.body.jwt);

  if (!isValidJWT) {
    res.json(unauthorizedResponse);
    return;
  }

  const data = prepData(req.body);

  try {
    const sql = await query(`INSERT INTO shopping_list (${data.columns}) VALUES (${data.marks})`, data.values);

    const response = {
      message: "Shopping List.",
      status: 200,
      data: sql,
    };

    res.json(response);
  } catch (e) {
    const response = {
      message: e.sqlMessage,
      status: e.errno,
      data: null,
    };

    res.json(response);
    console.log(e);
  }
});

router.post(`${apiRoute}/rm/shopping-list/remove`, async (req, res) => {
  const isValidJWT = await authorize(req.body.jwt);

  if (!isValidJWT) {
    res.json(unauthorizedResponse);
    return;
  }

  const data = prepData(req.body);

  try {
    const sql = await query(`UPDATE shopping_list SET got_by = ? WHERE id IN (?);`, data.values);

    const response = {
      message: "Shopping List.",
      status: 200,
      data: sql,
    };

    res.json(response);
  } catch (e) {
    const response = {
      message: e.sqlMessage,
      status: e.errno,
      data: null,
    };

    res.json(response);
    console.log(e);
  }
});

router.post(`${apiRoute}/folks/auth`, async (req, res) => {
  const authorized = await authorize(req.body.jwt);

  if (authorized) {
    res.json({
      message: "Authorized",
      status: 200,
      data: { login: true },
    });
  } else {
    res.json(unauthorizedResponse);
  }
});

router.post(`${apiRoute}/folks/login`, async (req, res) => {
  const loginData = req.body;

  let response = {};

  try {
    const sql = await query(`SELECT password FROM users WHERE email_address = "${loginData.emailAddress}"`);

    // Email address not found.
    if (!sql.length) {
      response = {
        message: `Login failed.`,
        status: 200,
        data: { login: false },
      };

      res.json(response);
      return;
    }

    const passwordFromDatabase = sql[0].password;
    const loginSuccess = loginData.password === passwordFromDatabase;

    if (loginSuccess) {
      const dataForToken = {
        emailAddress: loginData.emailAddress,
      };

      const token = await jsonwebtoken.default.sign({ data: dataForToken }, privateKey, { expiresIn: "1d" });

      response = {
        message: `Login Success and JSON Web Token.`,
        status: 200,
        data: { login: true, token },
      };
    } else {
      response = {
        message: `Login failed.`,
        status: 200,
        data: { login: false },
      };
    }

    res.json(response);
  } catch (e) {
    response = {
      message: `Login failed.`,
      status: 200,
      data: { login: false },
    };

    res.json(response);
    console.log(e);
  }
});

router.post(`${apiRoute}/folks/new-hang`, async (req, res) => {
  const isValidJWT = await authorize(req.body.jwt);

  if (!isValidJWT) {
    res.json(unauthorizedResponse);
    return;
  }

  const folksAtHang = req.body.folksAtHang;

  delete req.body.folksAtHang;

  const data = prepData(req.body);

  try {
    const hangsQuery = await query(`INSERT INTO hangs (${data.columns}) VALUES (${data.marks})`, data.values);

    const hangId = hangsQuery.insertId;

    let sqlString = `INSERT INTO folks_at_hangs (folks_id, hangs_id) VALUES `;

    for (let index = 0; index < folksAtHang.length; index++) {
      sqlString = `${sqlString} (?, ?),`;
    }

    // Remove trailing comma.
    sqlString = sqlString.slice(0, -1);

    const values = folksAtHang.flatMap((folkId) => [folkId, hangId]);

    const folksAtHangsQuery = await query(sqlString, values);

    const response = {
      message: "New hang successfully inserted.",
      status: 200,
      data: {
        hangsQuery,
        folksAtHangsQuery,
      },
    };

    res.json(response);
  } catch (e) {
    const response = {
      message: e.sqlMessage,
      status: e.errno,
      data: null,
    };

    res.json(response);
    console.log(e);
  }
});

router.post(`${apiRoute}/folks/new-folk`, async (req, res) => {
  const isValidJWT = await authorize(req.body.jwt);

  if (!isValidJWT) {
    res.json(unauthorizedResponse);
    return;
  }

  const data = prepData(req.body);

  try {
    const sql = await query(`INSERT INTO folks (${data.columns}) VALUES (${data.marks})`, data.values);

    const response = {
      message: "New folk successfully inserted.",
      status: 200,
      data: sql,
    };

    res.json(response);
  } catch (e) {
    const response = {
      message: e.sqlMessage,
      status: e.errno,
      data: null,
    };

    res.json(response);
    console.log(e);
  }
});

router.post(`${apiRoute}/folks/hangs/:id/add-folks`, async (req, res) => {
  const isValidJWT = await authorize(req.body.jwt);

  if (!isValidJWT) {
    res.json(unauthorizedResponse);
    return;
  }

  const folksAtHang = req.body.folks;
  if (!folksAtHang.length) return;

  const hangId = Number(req.params.id);

  let queryString = "INSERT INTO folks_at_hangs (folks_id, hangs_id) VALUES ";

  for (let index = 0; index < folksAtHang.length; index++) {
    queryString = ` ${queryString} (?, ?),`;
  }

  // Remove final comma.
  queryString = queryString.slice(0, -1).trim();

  const values = folksAtHang.flatMap((value) => [value, hangId]);

  try {
    const sql = await query(queryString, values);

    const response = {
      message: "Folks inserted.",
      status: 200,
      data: sql,
    };

    res.json(response);
  } catch (e) {
    const response = {
      message: e.sqlMessage,
      status: e.errno,
      data: null,
    };

    res.json(response);
    console.log(e);
  }
});

router.post(`${apiRoute}/folks/hangs/:id/update`, async (req, res) => {
  const isValidJWT = await authorize(req.body.jwt);

  if (!isValidJWT) {
    res.json(unauthorizedResponse);
    return;
  }

  const id = req.params.id;
  const data = prepData(req.body);

  const columns = data.columns;
  const values = data.values;

  let queryString = "";

  for (let index = 0; index < Object.keys(data).length; index++) {
    const column = columns[index];
    const value = values[index];

    queryString = `${queryString} ${column} = "${value}",`;
  }

  // Remove final comma.
  queryString = queryString.slice(0, -1);

  try {
    // Not using a parameterized query here to avoid escaping question marks.
    // I'm not worried since it's a post request with a JWT auth.
    const sql = await query(`UPDATE hangs SET ${queryString} WHERE id = ${id}`);

    const response = {
      message: "Folks inserted.",
      status: 200,
      data: sql,
    };

    res.json(response);
  } catch (e) {
    const response = {
      message: e.sqlMessage,
      status: e.errno,
      data: null,
    };

    res.json(response);
    console.log(e);
  }
});

router.post(`${apiRoute}/folks/:id/hangs/`, async (req, res) => {
  const isValidJWT = await authorize(req.body.jwt);

  if (!isValidJWT) {
    res.json(unauthorizedResponse);
    return;
  }

  const id = req.params.id;

  try {
    const sql = await query(
      `SELECT date, details, hangs_id, location FROM folks_at_hangs JOIN hangs ON hangs.id = folks_at_hangs.hangs_id WHERE folks_id = ${id} ORDER BY date DESC;`
    );

    console.log(sql[0]);

    const response = {
      message: "All hangs.",
      status: 200,
      data: sql,
    };

    res.json(response);
  } catch (e) {
    const response = {
      message: e.sqlMessage,
      status: e.errno,
      data: null,
    };

    res.json(response);
    console.log(e);
  }
});

router.post(`${apiRoute}/folks/hangs/`, async (req, res) => {
  const isValidJWT = await authorize(req.body.jwt);

  if (!isValidJWT) {
    res.json(unauthorizedResponse);
    return;
  }

  try {
    const sql = await query(
      `SELECT hangs.id AS hangs_id, folks.id AS folks_id, date, details, location, name FROM hangs JOIN folks_at_hangs ON hangs.id = folks_at_hangs.hangs_id JOIN folks ON folks_at_hangs.folks_id = folks.id ORDER BY date DESC`
    );

    const hangMap = new Map();

    sql.forEach((hang) => {
      const hangId = hang.hangs_id;

      if (hangMap.has(hangId)) {
        const data = {
          id: hangId,
          atHangs: hangMap.get(hangId).atHangs,
          location: hangMap.get(hangId).location,
          date: hangMap.get(hangId).date,
          details: hangMap.get(hangId).details,
        };

        data.atHangs.push({ id: hang.folks_id, name: hang.name });
        hangMap.set(hangId, data);
      } else {
        const data = {
          id: hangId,
          atHangs: [{ id: hang.folks_id, name: hang.name }],
          location: hang.location,
          date: hang.date,
          details: hang.details,
        };

        hangMap.set(hangId, data);
      }
    });

    const hangData = [...hangMap.values()];

    const response = {
      message: "All hangs.",
      status: 200,
      data: hangData,
    };

    res.json(response);
  } catch (e) {
    const response = {
      message: e.sqlMessage,
      status: e.errno,
      data: null,
    };

    res.json(response);
    console.log(e);
  }
});

router.post(`${apiRoute}/folks/hangs/:id`, async (req, res) => {
  const isValidJWT = await authorize(req.body.jwt);

  if (!isValidJWT) {
    res.json(unauthorizedResponse);
    return;
  }

  const id = req.params.id;

  try {
    const sql = await query(`SELECT * from hangs WHERE id = ${id};`);

    const response = {
      message: "All hangs.",
      status: 200,
      data: sql,
    };

    res.json(response);
  } catch (e) {
    const response = {
      message: e.sqlMessage,
      status: e.errno,
      data: null,
    };

    res.json(response);
    console.log(e);
  }
});

router.post(`${apiRoute}/folks/hangs/:id/delete-folks`, async (req, res) => {
  const isValidJWT = await authorize(req.body.jwt);

  if (!isValidJWT) {
    res.json(unauthorizedResponse);
    return;
  }

  const id = req.params.id;

  try {
    const sql = await query(`DElETE FROM folks_at_hangs WHERE hangs_id = ${id};`);

    const response = {
      message: `Deleted folks at hang ${id}.`,
      status: 200,
      data: sql,
    };

    res.json(response);
  } catch (e) {
    const response = {
      message: e.sqlMessage,
      status: e.errno,
      data: null,
    };

    res.json(response);
    console.log(e);
  }
});

router.post(`${apiRoute}/folks/at-hangs/:id`, async (req, res) => {
  const isValidJWT = await authorize(req.body.jwt);

  if (!isValidJWT) {
    res.json(unauthorizedResponse);
    return;
  }

  const id = req.params.id;

  try {
    const sql = await query(
      `SELECT folks.id, folks.name from folks_at_hangs join folks on folks.id = folks_at_hangs.folks_id where folks_at_hangs.hangs_id = ${id};`
    );

    const response = {
      message: "All folks at hang.",
      status: 200,
      data: sql,
    };

    res.json(response);
  } catch (e) {
    const response = {
      message: e.sqlMessage,
      status: e.errno,
      data: null,
    };

    res.json(response);
    console.log(e);
  }
});

router.post(`${apiRoute}/folks/facts/:id`, async (req, res) => {
  const isValidJWT = await authorize(req.body.jwt);

  if (!isValidJWT) {
    res.json(unauthorizedResponse);
    return;
  }

  const id = req.params.id;

  try {
    const sql = await query(`SELECT fact_title, fact_info FROM facts WHERE folks_id = ${id};`);

    const response = {
      message: "All facts.",
      status: 200,
      data: sql,
    };

    res.json(response);
  } catch (e) {
    const response = {
      message: e.sqlMessage,
      status: e.errno,
      data: null,
    };

    res.json(response);
    console.log(e);
  }
});

router.post(`${apiRoute}/folks/new-folk`, async (req, res) => {
  const isValidJWT = await authorize(req.body.jwt);

  if (!isValidJWT) {
    res.json(unauthorizedResponse);
    return;
  }

  const data = prepData(req.body);

  try {
    const sql = await query(`INSERT INTO folks (${data.columns}) VALUES (${data.marks})`, data.values);

    const response = {
      message: "New folk successfully inserted.",
      status: 200,
      data: sql,
    };

    res.json(response);
  } catch (e) {
    const response = {
      message: e.sqlMessage,
      status: e.errno,
      data: null,
    };

    res.json(response);
    console.log(e);
  }
});

router.post(`${apiRoute}/folks/:id/new-fact`, async (req, res) => {
  const isValidJWT = await authorize(req.body.jwt);

  if (!isValidJWT) {
    res.json(unauthorizedResponse);
    return;
  }

  const data = prepData(req.body);

  try {
    const sql = await query(`INSERT INTO facts (${data.columns}) VALUES (${data.marks})`, data.values);

    const response = {
      message: "New fact successfully inserted.",
      status: 200,
      data: sql,
    };

    res.json(response);
  } catch (e) {
    const response = {
      message: e.sqlMessage,
      status: e.errno,
      data: null,
    };

    res.json(response);
    console.log(e);
  }
});

router.post(`${apiRoute}/folks/:id`, async (req, res) => {
  const isValidJWT = await authorize(req.body.jwt);

  if (!isValidJWT) {
    res.json(unauthorizedResponse);
    return;
  }

  const id = req.params.id;

  try {
    const sql = await query(`SELECT * FROM folks WHERE id = "${id}" LIMIT 1`);

    const response = {
      message: "Folk.",
      status: 200,
      data: sql,
    };

    res.json(response);
  } catch (e) {
    const response = {
      message: e.sqlMessage,
      status: e.errno,
      data: null,
    };

    res.json(response);
    console.log(e);
  }
});

router.post(`${apiRoute}/folks/`, async (req, res) => {
  const isValidJWT = await authorize(req.body.jwt);

  if (!isValidJWT) {
    res.json(unauthorizedResponse);
    return;
  }

  try {
    const sql = await query(`SELECT * FROM folks ORDER BY name ASC`);

    const response = {
      message: "All Folks.",
      status: 200,
      data: sql,
    };

    res.json(response);
  } catch (e) {
    const response = {
      message: e.sqlMessage,
      status: e.errno,
      data: null,
    };

    res.json(response);
  }
});

export default router;
