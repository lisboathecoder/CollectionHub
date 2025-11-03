import RarityModel from "../models/rarityModel.js";
import { ok, fail } from "./utils.js";

export default {
  async list(req, res) {
    try {
      ok(res, await RarityModel.list());
    } catch (e) {
      fail(res, e, 500);
    }
  },
  async get(req, res) {
    try {
      const r = await RarityModel.get(req.params.code);
      if (!r) return fail(res, "Not found", 404);
      ok(res, r);
    } catch (e) {
      fail(res, e, 500);
    }
  },
  async create(req, res) {
    try {
      ok(res, await RarityModel.create(req.body), 201);
    } catch (e) {
      fail(res, e, 400);
    }
  },
  async update(req, res) {
    try {
      ok(res, await RarityModel.update(req.params.code, req.body));
    } catch (e) {
      fail(res, e, 400);
    }
  },
  async remove(req, res) {
    try {
      ok(res, await RarityModel.remove(req.params.code));
    } catch (e) {
      fail(res, e, 400);
    }
  },
};
