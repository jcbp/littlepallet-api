const express = require('express');
const listController = require('./list-controller');
const templateController = require('./template-controller');
const itemController = require('./item-controller');
const fieldController = require('./field-controller');
const filterController = require('./filter-controller');
const viewController = require('./view-controller');

const router = express.Router();

router.get('/list', listController.getLists);
router.get('/list/:id', listController.getList);
router.post('/list', listController.createList);
router.post('/list/from/:id', listController.createListFromAnother);
router.patch('/list/:id', listController.updateList);

router.patch('/list/:id/view', viewController.updateView);

router.post('/template/from/:listId', templateController.createTemplate);
router.get('/template', templateController.getTemplates);

router.post('/list/:id/item', itemController.createItem);
router.post('/list/:id/item/at/:position', itemController.createItemAtPosition);
router.patch('/list/:listId/item/:itemId', itemController.updateItem);
router.delete('/list/:listId/item/:itemId', itemController.deleteItem);
router.patch('/list/:listId/item/:itemId/field/:fieldId', itemController.updateItemField);

router.post('/list/:id/field', fieldController.createField);
router.post('/list/:id/field/at/:position', fieldController.createFieldAtPosition);
router.patch('/list/:listId/field/:fieldId', fieldController.updateField);
router.delete('/list/:listId/field/:fieldId', fieldController.deleteField);

router.post('/list/:id/filter', filterController.createFilter);
router.patch('/list/:listId/filter/:filterId', filterController.updateFilter);

router.post('/', (req, res) => {
  console.log(req.body);
  res.status(200).send({message: '...'});
});

module.exports = router;