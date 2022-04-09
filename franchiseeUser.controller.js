const Franchise = require('../../models/leads/franchiseeUser.model');
const catchAsync = require('../../helpers/new-utils/catchAsync');
//ST20220224
const msal = require('@azure/msal-node');
const jwt = require('jsonwebtoken');
const AuthActionLogs = require('../../models/auth/authActionLogs.model');

const config = {
  auth: {
    clientId: process.env.MS_CLIENTID,
    authority: `https://login.microsoftonline.com/${process.env.MS_APPID}`,
    clientSecret: process.env.MS_CLIENTSECRET,
  },
  system: {
    loggerOptions: {
      loggerCallback(loglevel, message, containsPii) {
        console.log(message, '\n', loglevel);
      },
      piiLoggingEnabled: false,
      logLevel: msal.LogLevel.Verbose,
    },
  },
};

// Create msal application object
const cca = new msal.ConfidentialClientApplication(config);

const createToken = async (id) => {
  return await jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES,
  });
};

//create and send token
const createSendToken = async (
  user,
  statusCode,
  req,
  res,
  message = 'task sucssesful',
  userData
) => {
  const token = await createToken(`FranchiseeUser_${user.FranchiseeUserId}`);

  const data = {
    SuperUserId  : userData.FranchiseeUserId,
    FranchiseId : userData.FranchiseId,
    loginToken: token,
    productsArr: [],
    portalFunctions: [],
    StageId: userData.StageId,
    UserRole:userData.UserRole
  };

  const cookieOptions = {
    expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
    httpOnly: true,
  };

  res.cookie('jwt', token, cookieOptions);

  // user.password = undefined;

  return res.status(statusCode).json({
    message_code: 1000,
    message_text: message,
    message_data: data,
  });
};

//ST20220224
//FranchiseeUser logIn
exports.logIn = catchAsync(async (req, res, next) => {
  const { Email, Password } = req.body;

  const data = await new Franchise().findFranchiseeUser(Email, Password);

  await createSendToken(data, 200, req, res, 'login success', {
    FranchiseeUserId: data.FranchiseeUserId,
    FranchiseId: data.FranchiseId,
    StageId: data.StageId,
    UserRole:data.UserRole,
  });

  await new AuthActionLogs().createAuthActionLogs({
    UserId: data.FranchiseeUserId,
    UserType: 4,
    AuthActionType: 1,
    DateTimeStamp: new Date().getTime() / 1000,
  });
});

//ST20220207
//create new FranachiseeUser
exports.createNewFranchiseeUser = catchAsync(async (req, res, next) => {
  const FranchiseData = { ...req.body };
  const data = await new Franchise().insertFranchiseeUser(FranchiseData);

  res.status(200).json({
    message_code: 1000,
    message_text: 'success',
    message_data: data,
  });
});


//ST20220207
//get all FranachiseeUser
exports.getAllFranchiseeUser = catchAsync(async (req, res, next) => {
  const data = await new Franchise().selectAllFranchiseeUser();

  res.status(200).json({
    message_code: 1000,
    message_text: 'success',
    message_data: data,
  });
});

//ST20220207
//get single FranachiseeUser
exports.getSingleFranchiseeUser = catchAsync(async (req, res, next) => {
  const { FranchiseeUserId } = req.body;

  const data = await new Franchise().getSingleFranchiseeUser(FranchiseeUserId);
  const messageText = 'FranchiseUser retrieved';

  res.status(200).json({
    message_code: 1000,
    message_text: messageText,
    message_data: data,
  });
});

//ST20220211
//GET ALL FranchiseeUsers under FranchiseID
exports.getFranchiseeUsersByFranchiseId = catchAsync(async (req, res, next) => {
  const { FranchiseId  } = req.body;

  const data = await new Franchise().getFranchiseeUsersByFranchiseId(FranchiseId);
  const messageText = 'All FranchiseUsers of this FranchiseId retrieved';

  res.status(200).json({
    message_code: 1000,
    message_text: messageText,
    message_data: data,
  });
});

//ST20220207
//update FranachiseeUser
exports.updateFranchiseeUser = catchAsync(async (req, res, next) => {
  const franchiseupdateData = { ...req.body };

  const data = await new Franchise().updateFranchiseeUser(franchiseupdateData);

  res.status(200).json({
    message_code: 1000,
    message_text: 'success',
    message_data: data,
  });
});

//ST20220207
//delete FranachiseeUser
exports.deleteFranchiseeUser = catchAsync(async (req, res, next) => {
  const FranchiseeUserId = req.params.id;
  const franchiseupdateData = { ...req.body };

  const data = await new Franchise().deleteFranchiseeUser(franchiseupdateData , FranchiseeUserId);

  res.status(200).json({
    message_code: 1000,
    message_text: 'success',
    message_data: data,
  });
});

//ST20220210
//update password for FranchiseeUser
exports.updateFranchiseeUserPassword = catchAsync(async (req, res, next) => {
  const { FranchiseeUserId } = req.body;

  const data = await new Franchise().updateFranchiseeUserPassword(FranchiseeUserId);

  return res.json({
    message_code: 1000,
    message_text:
      'Reset password',
    message_data: data,
  });
});

//ST20220207
//new update password
exports.updatePassword = catchAsync(async (req, res, next) => {
  const franchiseeUser = { ...req.body };

  const data = await new Franchise().updatePassword(franchiseeUser);

  return res.json({
    message_code: 1000,
    message_text: 'Password updated.',
    message_data: data,
  });
});

//Image
exports.UploadProfilePicture = catchAsync(async (req, res, next) => {
  const FranchiseeUserId = req.params.id;
  const file = { ...req.file };

  const profilePic = {
    FranchiseeUserId,
    file,

    ...req.body,
  };

  const data = await new Franchise().uploadImage(profilePic);

  return res.json({
    message_code: 1000,
    message_text: 'Profile picture uploaded',
    message_data: { ProfileImageName: data },
  });
});
