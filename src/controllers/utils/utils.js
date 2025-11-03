export function ok(res, data, status = 200) {
  res.status(status).json({ ok: true, data });
}
export function fail(res, err, status = 400) {
  res.status(status).json({ ok: false, error: String(err?.message || err) });
}
