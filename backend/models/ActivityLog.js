const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const ActivityLog = sequelize.define("ActivityLog", {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  action: {
    type: DataTypes.STRING
  },
  resource: {
    type: DataTypes.STRING
  },
  riskScore: {
    type: DataTypes.INTEGER
  },
  decision: {
    type: DataTypes.STRING
  }
});

module.exports = ActivityLog;