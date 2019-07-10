const express = require('express');
const router = express.Router();

router.route('/').post((req, res) => {
  console.log("[POST] actions/find: ", req.body);

  return res.status(200).json(req.body);
});

module.exports = router;
