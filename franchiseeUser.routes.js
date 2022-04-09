const express = require('express');
const { protect } = require('../../controllers/auth/auth.controller');
const {
  getAllFranchiseeUser,
  getSingleFranchiseeUser,
  getFranchiseeUsersByFranchiseId,
  updateFranchiseeUser,
  createNewFranchiseeUser,
  deleteFranchiseeUser,
  updateFranchiseeUserPassword 
} = require('../../controllers/leads/franchiseeUser.controller');

const Franchise = require('../../models/leads/franchiseeUser.model');
const franchise = require('../../controllers/leads/franchiseeUser.controller.js');
//const franchise = require('../../controllers/leads/franchise.controller.js');
const upload = require('../../helpers/file-upload');

const franchiseUserTokenRouter = require('./franchiseUserToken.routes');

const router = express.Router();

router.use('/tokens', franchiseUserTokenRouter);

//new
// change password
router.patch('/update-pwd', franchise.updatePassword);


// Franchiselogin api
router.post('/login', franchise.logIn);
//image
router.post(
  '/upload-user-profile-picture/:id',
  upload('mentor-profile-images', 'image', 'image').array('image', 1),
  franchise.UploadProfilePicture
);



//ST20220207
//All API route for FranchiseeUser
router.get('/get-franchiseeUser', getAllFranchiseeUser);
router.post('/get-single-franchiseeUser', getSingleFranchiseeUser);

router.patch('/update-franchiseeUser', updateFranchiseeUser);
router.post('/add-franchiseeUser', createNewFranchiseeUser);

router.use(protect);
router.post('/delete-franchiseeUser/:id', deleteFranchiseeUser);

//ST20220211
router.post('/getAll-franchiseeUserById', getFranchiseeUsersByFranchiseId);

//ST20220212
//update password for FranchiseeUser
router.post('/password-reset',updateFranchiseeUserPassword);


module.exports = router;
