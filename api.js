import express from "express";
import { query, apiRoute, prepData } from "./dbConnect.js";
import config from "./config/index.js";

import * as jsonwebtoken from "jsonwebtoken";

const privateKey = config.keys.jwt;

const router = express.Router();

router.post(`${apiRoute}/admin/jwt`, async (req, res) => {
  const tokenFromFrontEnd = req.body.token;

  let response = {};

  const auth = await jsonwebtoken.default.verify(tokenFromFrontEnd, privateKey, function (err, decoded) {
    if (err) {
      response = {
        message: "Invalid JWT",
        status: 401,
        data: { valid: false },
      };
    } else {
      response = {
        message: "Valid JWT",
        status: 200,
        data: { valid: true },
      };
    }

    res.json(response);
  });
});

router.get(`${apiRoute}/folks/`, async (req, res) => {
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
    console.log(e);
  }
});

router.get(`${apiRoute}/folks/:id`, async (req, res) => {
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

router.get(`${apiRoute}/folks/:id/hangs/`, async (req, res) => {
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

router.get(`${apiRoute}/folks/hangs/:id`, async (req, res) => {
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

router.get(`${apiRoute}/folks/at-hangs/:id`, async (req, res) => {
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

router.post(`${apiRoute}/folks/new-hang`, async (req, res) => {
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

export default router;
