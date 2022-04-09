const sql = require('../db');
const AppError = require('../../helpers/new-utils/appError');
const HelperClass = require('../../helpers/helperClass');
const validator = require('validator').default;
const sql1 = require('../db');
const Function = require('../misc/functions.model');
const validPass = require('../../helpers/validationhelper');
const bcrypt = require('bcryptjs');
const Email = require('../../helpers/email');


class Franchise extends HelperClass {
  //ST20220207
  //add franchiseeuser
  async insertFranchiseeUser(franchise) {
    let {
      FranchiseeUserName,
      FranchiseId,
      Gender,
      Country,
      Mobile,
      Email,
      DateOfBirth,
      ProfileImageName,
      StatusLine,
      MaritalStatus,
      LanguageId,
      ProfileStatus,
      RegisteredBy,
      SourceId,
      StageId,
      RegisteredFrom,
      ReferenceBy,
      FranchiseReferralCode,
      IsTestSuperUser,
      IsDeleted = 0,
      CreatedOn = Date.now() + 100,
      CreatedBy,
      LastmodifiedOn = Date.now() + 100,
      LastmodifiedBy,
      SuperUserSocialMediaId,
      SuperUserSocialMediaAuthToken,
      SecurityKeyEncrptionAlgo,
      UserRole

    } = franchise

    const { FranchiseeuserPassword } = franchise;

    if (!SecurityKeyEncrptionAlgo) SecurityKeyEncrptionAlgo = 1;

    if (!validPass.validPassword(FranchiseeuserPassword))
      throw new AppError(
        'Please make use of upper and lower case letter with special symbol and Number',
        400
      );

    const checkIntegerArr = [];
    const checkStringArr = [];


    //set default value
    if (SecurityKeyEncrptionAlgo)
      checkIntegerArr.push(SecurityKeyEncrptionAlgo);
    else SecurityKeyEncrptionAlgo = 1;

    if (FranchiseeUserName) checkStringArr.push(FranchiseeUserName);
    else FranchiseeUserName = null;

    if (FranchiseId === undefined)
      throw new AppError('No FranchiseId provided', 400);

    // CHECK IF VALUES ARE PRESENT
    this.checkIfValuesPresentObject({
      FranchiseeUserName,
      FranchiseId,
      Gender,
      Country,
      Mobile,
      Email,
      DateOfBirth,
      ProfileImageName,
      StatusLine,
      MaritalStatus,
      LanguageId,
      ProfileStatus,
      RegisteredBy,
      SourceId,
      StageId,
      RegisteredFrom,
      ReferenceBy,
      FranchiseReferralCode,
      IsTestSuperUser,
      IsDeleted,
      CreatedOn,
      CreatedBy,
      LastmodifiedOn,
      LastmodifiedBy,
      SuperUserSocialMediaId,
      SuperUserSocialMediaAuthToken,
      FranchiseeuserPassword,
      UserRole

    });

    // check if values passed are string or not
    [
      FranchiseeUserName,
      Mobile,
      Email,
      DateOfBirth,
      ProfileImageName,
      StatusLine,
      FranchiseReferralCode,
      SuperUserSocialMediaId,
      SuperUserSocialMediaAuthToken,
      FranchiseeuserPassword,
      ...checkStringArr,
    ].forEach((el) => this.checkIfValueIsString(el));

    //check if values passed are int or not
    [
      FranchiseId,
      Gender,
      Country,
      MaritalStatus,
      LanguageId,
      ProfileStatus,
      RegisteredBy,
      SourceId,
      StageId,
      RegisteredFrom,
      ReferenceBy,
      IsTestSuperUser,
      IsDeleted,
      CreatedOn,
      CreatedBy,
      LastmodifiedOn,
      LastmodifiedBy,
      UserRole,
      ...checkIntegerArr,
    ].forEach((el) => this.checkIfValueIsInteger(el));

    if (Mobile.length !== 10)
      throw new AppError(`Please provide valid Contact No`, 400);

    if (!SecurityKeyEncrptionAlgo) SecurityKeyEncrptionAlgo = 1;

    if (SecurityKeyEncrptionAlgo)
      checkIntegerArr.push(SecurityKeyEncrptionAlgo);
    else SecurityKeyEncrptionAlgo = 1;

    const FranchiseQuery = `INSERT INTO tblFranchiseeUser(
            FranchiseeUserName,
            FranchiseId,
            Gender,
            Country,
            Mobile,
            Email,
            DateOfBirth,
            ProfileImageName,
            StatusLine,
            MaritalStatus,
            LanguageId,
            ProfileStatus,
            RegisteredBy,
            SourceId,
            StageId,
            RegisteredFrom,
            ReferenceBy,
            FranchiseReferralCode,
            IsTestSuperUser,
            IsDeleted,
            CreatedOn,
            CreatedBy,
            LastmodifiedOn,
            LastmodifiedBy,
            SuperUserSocialMediaId,
            SuperUserSocialMediaAuthToken,
            UserRole
            ) Output Inserted.FranchiseeUserId VALUES(
                
                '${FranchiseeUserName}',
                ${FranchiseId},
                ${Gender},
                ${Country},
                '${Mobile}',
                '${Email}',
                '${DateOfBirth}',
                '${ProfileImageName}',
                '${StatusLine}',
                ${MaritalStatus},
                ${LanguageId},
                ${ProfileStatus},
                ${RegisteredBy},
                ${SourceId},
                ${StageId},
                ${RegisteredFrom},
                ${ReferenceBy},
                '${FranchiseReferralCode}',
                ${IsTestSuperUser},
                ${IsDeleted},
                ${CreatedOn},
                ${CreatedBy},
                ${LastmodifiedOn},
                ${LastmodifiedBy},
                '${SuperUserSocialMediaId}',
                '${SuperUserSocialMediaAuthToken}',
              ${UserRole}
        );select	SCOPE_IDENTITY(); `;

    const FranchiseData = await sql.query(FranchiseQuery);

    const FUID = FranchiseData.recordset[0].FranchiseeUserId;

    if (FranchiseData.rowsAffected[0] === 0)
      throw new AppError('Insert failed, please try again.', 400);

    //using the bcrypt with a cost of 12 (the higher the cost the more CPU intensive the crypto process will be)
    const hash = await bcrypt.hash(FranchiseeuserPassword, 12);


    const savePass = `INSERT INTO  [dbo].[tblFranchiseeUserSecurity]
               ([FranchiseeUserId],[SecurityKey],[SecurityKeyStatus],[SecurityKeyEncrptionAlgo],[SecuriyKeyActivatedOn])
        VALUES (${FUID} ,'${hash}',1,${SecurityKeyEncrptionAlgo} , ${Date.now() + 100})`;


    await sql.query(savePass);

    return FUID;
  }

  //ST20220207
  //to get all the user from tblFranchiseeUser
  async selectAllFranchiseeUser() {
    const query = `select * from tblFranchiseeUser`;

    const data = await sql.query(query);

    const recordsetdata = data.recordset;
    return recordsetdata;
  }

  //ST20220207
  //get single Franchiseeuser by FranchiseeUserId
  async getSingleFranchiseeUser(FranchiseeUserId) {
    if (FranchiseeUserId === undefined)
      throw new AppError('No FranchiseeUserId provided', 400);

    const FranchiseQuery = `SELECT * from tblFranchiseeUser where FranchiseeUserId = ${FranchiseeUserId}`;
    const FranchiseData = await sql.query(FranchiseQuery);

    // console.log(FranchiseData);
    const FranchiseDataSet = FranchiseData.recordset;

    return FranchiseDataSet;
  }

  //ST20220211
  //get all Franchiseeuser by FranchiseeUserId
  async getFranchiseeUsersByFranchiseId(FranchiseId) {
    if (FranchiseId === undefined)
      throw new AppError('No FranchiseId provided', 400);

    const FranchiseQuery = `SELECT * from tblFranchiseeUser where FranchiseId = ${FranchiseId}`;
    const FranchiseData = await sql.query(FranchiseQuery);

    // console.log(FranchiseData);
    const FranchiseDataSet = FranchiseData.recordset;

    return FranchiseDataSet;
  }

  //ST20220207
  // to delete a table row based on FranchiseeUserId
  async deleteFranchiseeUser(franchiseupdateData, FranchiseeUserId) {

    let { DeletedBy } = franchiseupdateData;
    //const query = `DELETE from tblFranchiseeUser where FranchiseeUserId = ${FranchiseeUserId}`;

    let DeletedOn = Date.now() + 100;
    const query = `UPDATE tblFranchiseeUser IsDeleted = 1, LastModifiedOn = ${DeletedOn}, LastModifiedBy = ${DeletedBy} WHERE FranchiseeUserId = ${FranchiseeUserId}`;
    const data = await sql.query(query);

    return data.recordset;
  }

  //ST20220210
  //update franchiseeUser Password 
  async updateFranchiseeUserPassword(FranchiseeUserId) {

    if (FranchiseeUserId === undefined)
      throw new AppError('No FranchiseeUserId provided', 400);

    let FranchiseeuserPassword = "Galaxy@123";
    const hash = await bcrypt.hash(FranchiseeuserPassword, 12);

    if (!validPass.validPassword(FranchiseeuserPassword))
      throw new AppError(
        'Your password should 8 charasters with atleast 1 number, 1 uppercase and 1 lowercase togehter with 1 special symbol',
        400
      );


    const rowEmail = await sql.query(
      `Select [Email] as FranchiseIdEmail, FranchiseeUserName from tblFranchiseeUser Where FranchiseeUserId='${FranchiseeUserId}'`
    );

    const { FranchiseIdEmail, FranchiseeUserName } = rowEmail.recordset[0];

    const updatepass = `UPDATE tblFranchiseeUserSecurity SET SecurityKey='${hash}'
  WHERE FranchiseeUserId='${FranchiseeUserId}'`;

    await sql.query(updatepass);
    //email
    await new Email(
      {
        email: FranchiseIdEmail,
        name: FranchiseeUserName,
      },
      {
        FranchiseeuserPassword,
      }
    ).FranchiseeuserPassword();

    return FranchiseeuserPassword;

  }

  //ST20220307
  //new API for UpdatePassword
  async updatePassword(franchise) {
    const { Email: email, Password, newPassword } = franchise;

    this.checkIfValuesPresentObject({
      email,
      Password,
      newPassword,
    });

    if (!validPass.validPassword(newPassword))
      throw new AppError(
        'Please make use of upper and lower case letter with special symbol and Number',
        400
      );

    if (email === undefined)
      throw new AppError('Please provide SuperUser Email', 400);

    if (Password === undefined || Password.length === 0)
      throw new AppError('Please provide SuperUser Password', 400);

    if (!validator.isEmail(email) || validator.isEmpty(email))
      throw new AppError(
        'You have not entered the right format of email,Please check the email entered',
        400
      );

    const checkCredentials = `SELECT * FROM tblFranchiseeUser WHERE Email='${email}' and IsDeleted = 0`;

    const checkUser = await sql1.query(checkCredentials);

    if (checkUser.rowsAffected[0] === 0)
      throw new AppError('User does not exist in the database.', 401);

    const joinEmailPass = `select F.FranchiseeUserId, F.StageId,F.Email as Email, S.SecurityKey ,S.SecurityKeyStatus from tblFranchiseeUser
      as F inner join tblFranchiseeUserSecurity as S on F.FranchiseeUserId=S.FranchiseeUserId where F.FranchiseeUserId='${checkUser.recordset[0].FranchiseeUserId}' 
      And  S.SecurityKeyStatus=1`;

    const user = await sql1.query(joinEmailPass);

    if (user.rowsAffected[0] === 0)
      throw new AppError('Invalid Email or Password, please try again.', 401);

    const StageId = user.recordset[0].StageId || null;
    const { SecurityKey: dbpass, FranchiseeUserId } = user.recordset[0];

    if (!(await bcrypt.compare(Password, dbpass)))
      throw new AppError('Invalid Email or Password, please try again.', 401);

    if (user.recordset[0].SecurityKeyStatus !== 1)
      throw new AppError('User not active.', 401);

    //using the bcrypt with a cost of 12 (the higher the cost the more CPU intensive the crypto process will be)
    const hashpass = await bcrypt.hash(newPassword, 12);

    // update the tblCandidateSecurity table
    const updateQuery = `
        update tblFranchiseeUserSecurity set SecurityKey = '${hashpass}' where FranchiseeUserId = ${FranchiseeUserId}
    `;

    const data = await sql1.query(updateQuery);

    return data.recordset;
  }


  //ST20220224
  // FranchiseUser Login 
  async findFranchiseeUser(email, Password) {

    if (email === undefined)
      throw new AppError('Please provide FranchiseeUser Email for login', 400);

    if (Password === undefined || Password.length === 0)
      throw new AppError('Please provide FranchiseeUser Password for login', 400);

    if (!validator.isEmail(email) || validator.isEmpty(email))
      throw new AppError(
        'You have not entered the right format of email,Please check the email entered',
        400
      );

    const checkCredentials = `SELECT FranchiseId, FranchiseeUserId, StageId, UserRole FROM tblFranchiseeUser WHERE Upper(Email) = Upper('${email}') and IsDeleted = 0`;

    const checkUser = await sql1.query(checkCredentials);
    // const isfound = checkUser.rowsAffected;
    if (checkUser.rowsAffected === 0)
      throw new AppError('User does not exist in the database.', 401);

    const joinEmailPass = `select C.FranchiseeUserId, C.StageId, C.Email as Email, C.UserRole, S.SecurityKey ,S.SecurityKeyStatus from tblFranchiseeUser
      as C inner join tblFranchiseeUserSecurity as S on C.FranchiseeUserId=S.FranchiseeUserId where C.FranchiseeUserId='${checkUser.recordset[0].FranchiseeUserId}' 
      And  S.SecurityKeyStatus=1`;

    const user = await sql1.query(joinEmailPass);

    if (user.rowsAffected === 0)
      throw new AppError('Invalid Email or Password, please try again.', 401);

    const StageId = user.recordset[0].StageId || null;
    const FranchiseId = checkUser.recordset[0].FranchiseId;
    const UserRole = user.recordset[0].UserRole
    const { SecurityKey: dbpass, FranchiseeUserId } = user.recordset[0];

    // console.log(UserRole);


    if (!(await bcrypt.compare(Password, dbpass)))
      throw new AppError('Invalid Email or Password, please try again.', 401);

    if (user.recordset[0].SecurityKeyStatus !== 1)
      throw new AppError('User not active.', 401);

    return { FranchiseeUserId, FranchiseId, StageId,UserRole };
  }
  //upload Profile Pic
  async uploadImage(profilePic) {
    const { FranchiseeUserId, image } = profilePic;

    const fileName = image[0];

    const updateProfileName = `Update tblFranchiseeUser Set ProfileImageName='${fileName}' 
      Where FranchiseeUserId='${FranchiseeUserId}'`;

    console.log(fileName);

    await sql1.query(updateProfileName);

    return fileName;
  }

  //ST20220207
  //update model for tblFranchiseUser
  async updateFranchiseeUser(franchise) {

    const newFranchiseObj = this.returnValidColumnsOnly(
      franchise,
      await this.getTableColumnsList('tblFranchiseeUser')
    );

    const { FranchiseeUserId } = newFranchiseObj;

    this.checkIfValuesPresentObject({ FranchiseeUserId });
    this.checkIfValueIsInteger(FranchiseeUserId);

    delete newFranchiseObj.FranchiseeUserId;

    // construct the update query
    const query = `UPDATE tblFranchiseeUser
    SET ${this.returnUpdateQueryString(
      newFranchiseObj
    )} where FranchiseeUserId = ${FranchiseeUserId}`;

    // execute the query
    const data = await sql.query(query);

    return data.recordset;
  }



}

module.exports = Franchise;