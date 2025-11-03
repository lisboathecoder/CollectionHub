import CardModel from "../models/cardModel.js";
import { ok, fail } from "../utils/utils.js";

export default {
  async list(req, res) {
    try {
      ok(res, await CardModel.list(req.query));
    } catch (e) {
      fail(res, e, 500);
    }
  },
  async getByComposite(req, res) {
    try {
      const { set, number } = req.params;
      const r = await CardModel.getByComposite(set, number);
      if (!r) return fail(res, "Not found", 404);
      ok(res, r);
    } catch (e) {
      fail(res, e, 500);
    }
  },
  async getById(req, res) {
    try {
      const { id } = req.params;
      const r = await CardModel.get(id);
      if (!r) return fail(res, "Not found", 404);
      ok(res, r);
    } catch (e) {
      fail(res, e, 500);
    }
  },
  async create(req, res) {
    try {
      ok(res, await CardModel.create(req.body), 201);
    } catch (e) {
      fail(res, e, 400);
    }
  },
  async updateByComposite(req, res) {
    try {
      const { set, number } = req.params;
      ok(res, await CardModel.updateByComposite(set, number, req.body));
    } catch (e) {
      fail(res, e, 400);
    }
  },
  async removeByComposite(req, res) {
    try {
      const { set, number } = req.params;
      ok(res, await CardModel.removeByComposite(set, Number(number)));
    } catch (e) {
      fail(res, e, 400);
    }
  },
};
