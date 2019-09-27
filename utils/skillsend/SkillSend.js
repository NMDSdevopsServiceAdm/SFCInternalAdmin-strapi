'use strict';

const JWT = require('./JWT');
const axios = require('axios');

const endpointTransforms = {
  Qualification: "availableQualifications",
  Country: "country",
  Nationality: "nationality"
}

const msgTransforms = {
  Qualification: function (req) {
    return {
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
    },
    Country: function (req) {
      return {
        id: req.ID,
        seq: req.Seq,
        country: req.Country
      };
    },
    Nationality: function (req) {
      return {
        id: req.ID,
        seq: req.Seq,
        nationality: req.Nationality
      };
    }
  };

  function parseType(callingFile) {
    return  (
      callingFile.substring(callingFile.lastIndexOf("/")+1,
                            callingFile.lastIndexOf(".")) );
  }

  /* For Related Ref-Data - no examples yet exist
  async function getBusnObj(type,id) {
    const criteria={_id: id};
    strapi.log.info('criteria '+JSON.stringify(criteria)); 

    const promise=global[type]['findOne'](criteria).exec();  
    //const promise=Qualification.findOne(criteria).exec();  
    const busnobj=await promise;

    strapi.log.info('test busnobj '+JSON.stringify(busnobj));

    return busnobj;
  }*/

  /* Example adding Category to Restaurant - not in Ref Data so far
  async function genMsgBodyExpandCategory(update) {
    const catcriteria={_id: update.category};
    strapi.log.info('catcriteria '+JSON.stringify(catcriteria)); 

    const categorypromise=Category.findOne(catcriteria).exec();  
    const category=await categorypromise;

    strapi.log.info('category '+JSON.stringify(category));

    var msgbody=genMsgBody(update);
    msgbody.category=category;

    return msgbody;
  }*/

/**
 * Lifecycle callbacks for the `Cmdmodel` model.
 */

module.exports = {

  postContentType: async (callingFile, req) => {
    const IDPresent=req.ID;
    const type=parseType(callingFile);

    var msgBody=JSON.parse(JSON.stringify(msgTransforms[type](req)));
    msgBody.$set=undefined;
    msgBody.$setOnInsert=undefined;

    const endpointType=endpointTransforms[type];
    const postUrl = `${strapi.config.currentEnvironment.skillsBackendURL}${endpointType}`;
    strapi.log.info(`ASC WDS ${type} url: ${postUrl}`);

    // invoke API
    try { 
       const apiResponse = await axios(
          {
            method: 'post',
            url: postUrl,
            headers: {
              Authorization: `Bearer ${JWT.ASCWDS_JWT()}`
            },
            data: msgBody,
          }
       );

       if (apiResponse.status === 200) {
        if(apiResponse.data.id) {
           strapi.log.info('ASC WDS accepted the new '+type+' assigned key '+apiResponse.data.id);
           req.ID=apiResponse.data.id;        
         } else {
           if(!IDPresent) {
            strapi.log.error('ASC WDS accepted the new '+type+' with no key');
            throw new Error('ASC WDS API no id returned');
           } else {
             console.warn('ID present in request. Either pre-backend fix or bulk load');
           }
        }
        return;
       } else {
          strapi.log.error('ASC WDS rejected the new '+type);
          return;
       }
    } catch (err) {
       strapi.log.error("ERROR: ", err);
       throw new Error('Failed to update ASC WDS API');
    }
  },

  putContentType: async (callingFile, req)  => {
    if (!req.ID) {
       // just ignore this call; it's the follow to a create and therefore no properties other than "id"
       return;
    }

    const type=parseType(callingFile);

    var msgBody=JSON.parse(JSON.stringify(msgTransforms[type](req)));
    msgBody.$set=undefined;
    msgBody.$setOnInsert=undefined;
    msgBody.ID=undefined;

    const endpointType=endpointTransforms[type];
    const putUrl = `${strapi.config.currentEnvironment.skillsBackendURL}${endpointType}/${req.ID}`;
    strapi.log.info(`ASC WDS ${type} url: ${putUrl}`);

    // invoke API
    try { 
       const apiResponse = await axios(
          {
            method: 'put',
            url: putUrl,
            headers: {
              Authorization: `Bearer ${JWT.ASCWDS_JWT()}`
            },
            data: msgBody,
          }
       );

       if (apiResponse.status === 200) {
          strapi.log.info('ASC WDS accepted the updated '+type);
          return;
       } else {
          strapi.log.error('ASC WDS rejected the updated '+type);
          return;
       }
    } catch (err) {
       strapi.log.error("ERROR: ", err);
       throw new Error('Failed to update ASC WDS API');
    }
  }
};

