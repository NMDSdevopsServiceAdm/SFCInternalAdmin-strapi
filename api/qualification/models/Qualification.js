'use strict';

const skillsend = require('../../../utils/skillsend/SkillSend');

/**
 * Lifecycle callbacks for the `Cmdmodel` model.
 */

module.exports = {

  afterCreate: async (model) => {
    await skillsend.postContentType(__filename,model);
    
  },
  
  afterUpdate: async (model) => {
    await skillsend.putContentType(__filename,model._update);
  }
};
