'use strict';

const skillsend = require('skillsend/SkillSend');

/**
 * Lifecycle callbacks for the `Cmdmodel` model.
 */

module.exports = {

  afterUpdate: async (model,result) => {
    skillsend.afterUpdate(__filename,model,result);
  },

  beforeCreate: async (model) => {
    skillsend.beforeCreate(__filename,model);
  },
  
  beforeUpdate: async (model) => {
    skillsend.beforeUpdate(__filename,model);
  }
};
