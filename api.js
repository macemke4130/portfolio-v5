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
    const sql = await query(`INSERT INTO hangs (${data.columns}) VALUES (${data.marks})`, data.values);

    const response = {
      message: "New hang successfully inserted.",
      status: 200,
      data: sql,
    };

    const hangId = response.data.insertId;

    folksAtHang.forEach(async (folk) => {
      const folkId = Number(folk);
      await query(`INSERT INTO folks_at_hangs (folks_id, hangs_id) VALUES (?, ?)`, [folkId, hangId]);
    });

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
    const sql = await query(`SELECT * FROM folks;`);

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
