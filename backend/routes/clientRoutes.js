const express = require('express');
const router = express.Router();
const {
  getClients,
  getClientById,
  getMyClientPortal,
  uploadSitePhoto,
  createClient,
  updateClient,
  deleteClient,
} = require('../controllers/clientController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getClients).post(protect, createClient);

router.get('/my-portal', protect, getMyClientPortal);
router.post('/site-photos', protect, uploadSitePhoto);

router
  .route('/:id')
  .get(protect, getClientById)
  .put(protect, updateClient)
  .delete(protect, deleteClient);

module.exports = router;
