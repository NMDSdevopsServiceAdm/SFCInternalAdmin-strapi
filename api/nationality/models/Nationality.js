'use strict';

const skillsend = require('../../../utils/skillsend/SkillSend');

/**
 * Read the documentation () to implement custom service functions
 */


module.exports = {

    afterCreate: async (model) => {
      await skillsend.postContentType(__filename,model);
      
    },
    
    afterUpdate: async (model) => {
      await skillsend.putContentType(__filename,model._update);
    }
  };
  