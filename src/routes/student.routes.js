const express = require('express');
const validate = require('../middlewares/validate');
const controller = require('../controllers/student.controller');
const {
  studentSchema,
  idParamSchema,
  paginationSchema,
  searchSchema,
} = require('../validators/student.validator');

const router = express.Router();

// /search must be registered BEFORE /:id, otherwise "search" would be read as an id
router.get('/search', validate(searchSchema, 'query'), controller.search);

router.get('/', validate(paginationSchema, 'query'), controller.getAll);
router.post('/', validate(studentSchema), controller.create);

router.get('/:id', validate(idParamSchema, 'params'), controller.getById);
router.put('/:id', validate(idParamSchema, 'params'), validate(studentSchema), controller.update);
router.delete('/:id', validate(idParamSchema, 'params'), controller.remove);

module.exports = router;
