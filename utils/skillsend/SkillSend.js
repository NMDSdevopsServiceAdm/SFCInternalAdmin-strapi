'use strict';

const JWT = require('./JWT');
const axios = require('axios');

function msgQualification(req) {
  var x={ id: req.id, seq: req.Seq, title: req.Title,
          group: req.Group, code: req.Code, from: req.From,
          until: req.Until, level: req.Level, multipleLevel: req.MultipleLevel,
          socialCareRelevant: req.RelevantToSocialCare, analysisFileCode: req.AnalysisFileCode};
  return x;
}

const msgTransform = { Qualification: msgQualification};

  function parseType(callingFile) {
    return  (
      callingFile.substring(callingFile.lastIndexOf("/")+1,
                            callingFile.lastIndexOf(".")) );
  }
  
  async function send(type,method,mode,id, msgbody) {
    try {
      // ignore '/'+mode as always before
      const dest=strapi.config.currentEnvironment.skillsBackendURL
                 +type.toLowerCase()+'/'+id;  //+'/'+mode;
      strapi.log.info('Send dest:'+dest);
      var jwt=JWT.ASCWDS_JWT();
      
      // TODO: Sending all in BODY not as Header & Body *****
      const resp = await method(dest, {headers: { Authorization: `Bearer ${jwt}`}, data: msgbody});

      strapi.log.info('Send resp:'+resp.status);

    } catch(error) {
      strapi.log.error('send error '+error);
      throw new Error('send to skillsDB failed'); 
    }
  }

  async function getBusnObj(type,id) {
    const criteria={_id: id};
    strapi.log.info('criteria '+JSON.stringify(criteria)); 

    const promise=global[type]['findOne'](criteria).exec();  
    //const promise=Qualification.findOne(criteria).exec();  
    const busnobj=await promise;

    strapi.log.info('test busnobj '+JSON.stringify(busnobj));

    return busnobj;
  }

  // Generate a simple message body to send out - with no expanded 1:n
  async function genMsgBody(type, update) {

    console.log("type "+type);
    var msgbody=JSON.parse(JSON.stringify(msgTransform[type](update)));
    msgbody.$set=undefined;
    msgbody.$setOnInsert=undefined;
    return msgbody;
  }

  // Example adding Category to Restaurant - not in Ref Data so far
  async function genMsgBodyExpandCategory(update) {
    const catcriteria={_id: update.category};
    strapi.log.info('catcriteria '+JSON.stringify(catcriteria)); 

    const categorypromise=Category.findOne(catcriteria).exec();  
    const category=await categorypromise;

    strapi.log.info('category '+JSON.stringify(category));

    var msgbody=genMsgBody(update);
    msgbody.category=category;

    return msgbody;
  }

/**
 * Lifecycle callbacks for the `Cmdmodel` model.
 */

module.exports = {

  // This is for true UPDATES it only fires once saved without error 
  afterUpdate: async (callingFile,model,result) => {
    /* Commented out as going for remote site checking
    var type=parseType(callingFile);

    if(Object.keys(model._update).length<=3) {
      // update follows create to set key
      strapi.log.info('ignoring as update is key only');
      return;
    }

    var msgbody=await genMsgBody(model._update);
    await send(type,axios.put,'after',model._id,msgbody)
    .catch((err) => {console.log("Caught "+send)});
    */
  },

  // This is for CREATE 
  // use it if we hand off to the main site to report errors
  beforeCreate: async (callingFile,model) => {
    var type=parseType(callingFile);

    strapi.log.info('beforeCreate '+JSON.stringify(model));
    var msgbody=await genMsgBody(type,model);
    await send(type,axios.post,'before',model.id,msgbody)
      .catch((err) =>
      {
      console.log("Caught "+err);
      throw new Error("beforeCreate "+err); 
      });
  },
  
  // This is for UPDATE when we can hand off to the main site 
  // This is for CREATE it only fires once saved without error 
  beforeUpdate: async (callingFile,model) => {
    var type=parseType(callingFile);

    strapi.log.info('beforeUpdate '+JSON.stringify(model._update));

    if(Object.keys(model._update).length<=1) {
      // This is for CREATE it only fires once saved without error 
      // use it if we CAN'T hand off to the main site to report errors
      // but rather want to be 100% sure it is committed locally
      /* Commented out as going for remote site checking

      // update follows create to set key
      var savedrest=await getBusnObj(type,model._update.id);

      if(savedrest!=null) {
        strapi.log.info('beforeUpdate test failed');
        var msgbody=await genMsgBody(savedrest);
        await send(type,axios.post,'after',model._update.id,msgbody)
       .catch((err) => {console.log("Caught "+send)});
      }
      */
    } else {
        var msgbody=await genMsgBody(type,model._update);
        await send(type,axios.put,'before',model._update.id,msgbody)
          .catch((err) => {
            console.log("Caught "+err);
          });
      }
  },


  postQualification: async (req)  => {
    // map from Qualificatoin content type to API availableQualification JSON body
    const apiQualification = {
      id: req.ID,
      seq: req.Seq,
      title: req.Title,
      group: req.Group,
      code: req.Code,
      from: req.From,
      until: req.Until,
      level: req.Level,
      multipleLevel: req.MultipleLevel ? req.MultipleLevel : false,
      socialCareRelevant: req.RelevantToSocialCare ? req.RelevantToSocialCare : false,
      analysisFileCode: req.AnalysisFileCode
    }; 

    const postQualificationUrl = `${strapi.config.currentEnvironment.skillsBackendURL}availableQualifications`;
    strapi.log.info(`ASC WDS qual url: ${postQualificationUrl}`);

    // invoke API
    try { 
       const apiResponse = await axios(
          {
            method: 'post',
            url: postQualificationUrl,
            headers: {
              Authorization: `Bearer ${JWT.ASCWDS_JWT()}`
            },
            data: apiQualification,
          }
       );

       if (apiResponse.status === 200) {
          strapi.log.info('ASC WDS accepted the new qualificatoin');
          return;
       } else {
          strapi.log.error('ASC WDS rejected the new qualification');
          return;
       }
    } catch (err) {
       strapi.log.error("ERROR: ", err);
       throw new Error('Failed to update ASC WDS API');
    }
  },
  putQualification: async (req)  => {
    if (!req.ID) {
       // just ignore this call; it's the follow to a create and therefore no properties other than "id"
       return;
    }


    // map from Qualificatoin content type to API availableQualification JSON body
    const apiQualification = {
      //id: req.ID,
      seq: req.Seq,
      title: req.Title,
      group: req.Group,
      code: req.Code,
      from: req.From,
      until: req.Until,
      level: req.Level,
      multipleLevel: req.MultipleLevel ? req.MultipleLevel : false,
      socialCareRelevant: req.RelevantToSocialCare ? req.RelevantToSocialCare : false,
      analysisFileCode: req.AnalysisFileCode
    };

    const putQualificationUrl = `${strapi.config.currentEnvironment.skillsBackendURL}availableQualifications/${req.ID}`;
    strapi.log.info(`ASC WDS qual url: ${putQualificationUrl}`);

    // invoke API
    try { 
       const apiResponse = await axios(
          {
            method: 'put',
            url: putQualificationUrl,
            headers: {
              Authorization: `Bearer ${JWT.ASCWDS_JWT()}`
            },
            data: apiQualification,
          }
       );

       if (apiResponse.status === 200) {
          strapi.log.info('ASC WDS accepted the updated qualificatoin');
          return;
       } else {
          strapi.log.error('ASC WDS rejected the updated qualification');
          return;
       }
    } catch (err) {
       strapi.log.error("ERROR: ", err);
       throw new Error('Failed to update ASC WDS API');
    }
  }
};
