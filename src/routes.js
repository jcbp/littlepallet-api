const express = require('express');
const auth = require('./middleware/auth');
const multer  = require('multer');
const path = require('path');

const listController = require('./controllers/list-controller');
const templateController = require('./controllers/template-controller');
const itemController = require('./controllers/item-controller');
const fieldController = require('./controllers/field-controller');
const filterController = require('./controllers/filter-controller');
const userController = require('./controllers/user-controller');
const listUserController = require('./controllers/list-user-controller');
const itemCommentController = require('./controllers/item-comment-controller');

const upload = multer({dest: path.join(__dirname, '../public/uploads/')});
const router = express.Router();

router.post('/user', userController.signUp);
router.post('/user/login', userController.login);
router.get('/user/current', auth, userController.getCurrent);

router.post('/list/:id/user', auth, listUserController.addUser);
router.patch('/list/:listId/user/:userId', auth, listUserController.updateUser);
router.delete('/list/:listId/user/:userId', auth, listUserController.deleteUser);

router.post('/list/:listId/item/:itemId/comment', auth, itemCommentController.createComment);
router.post('/list/:listId/item/:itemId/comment/image', auth, upload.single('image'), itemCommentController.createComment);

router.get('/list', auth, listController.getLists);
router.get('/list/trash', auth, listController.getDeletedLists);
router.get('/list/:id', auth, listController.getList);
router.post('/list', auth, listController.createList);
router.post('/list/from/:id', auth, listController.createListFromAnother);
router.patch('/list/:id', auth, listController.updateList);
router.delete('/list/:id', auth, listController.deleteList);
router.patch('/list/:id/view', auth, listController.updateView);

router.post('/template/from/:listId', templateController.createTemplate);
router.get('/template/:lang', templateController.getTemplates);

router.post('/list/:id/item', auth, itemController.createItem);
router.post('/list/:id/item/at/:position', auth, itemController.createItemAtPosition);
router.patch('/list/:listId/item/:itemId/move/:position', auth, itemController.moveItemAtPosition);
router.patch('/list/:listId/item/:itemId', auth, itemController.updateItem);
router.delete('/list/:listId/item/:itemId', auth, itemController.deleteItem);
router.patch('/list/:listId/item/:itemId/field/:fieldId', auth, itemController.updateItemField);

router.post('/list/:id/field', auth, fieldController.createField);
router.post('/list/:id/field/at/:position', auth, fieldController.createFieldAtPosition);
router.patch('/list/:listId/field/:fieldId', auth, fieldController.updateField);
router.delete('/list/:listId/field/:fieldId', auth, fieldController.deleteField);

router.post('/list/:id/filter', auth, filterController.createFilter);
router.patch('/list/:listId/filter/:filterId', auth, filterController.updateFilter);

module.exports = router;