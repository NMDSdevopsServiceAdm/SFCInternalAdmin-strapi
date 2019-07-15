'use strict';

const skillsend = require('skillsend/SkillSend');

/**
 * Lifecycle callbacks for the `Cmdmodel` model.
 */

module.exports = {

  afterUpdate: async (model,result) => {
    await skillsend.afterUpdate(__filename,model,result);
  },

  afterCreate: async (model) => {
    await skillsend.postQualification(model);
  },
  
  afterUpdate: async (model) => {
    await skillsend.putQualification(model._update);
  }
};


