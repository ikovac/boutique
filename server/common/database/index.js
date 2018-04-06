'use strict';

const forEach = require('lodash/forEach');
const invoke = require('lodash/invoke');
const Sequelize = require('sequelize');
const Umzug = require('umzug');

const config = require('./config');
const migrationsPath = require('../../../.sequelizerc')['migrations-path'];

// Require models.
const User = require('../../user/user.model');

const isProduction = process.env.NODE_ENV === 'production';
const sequelize = new Sequelize(config.url, config);
const { Sequelize: { DataTypes } } = sequelize;

const defineModel = Model => {
  const fields = invoke(Model, 'fields', DataTypes, sequelize) || {};
  const hooks = invoke(Model, 'hooks') || {};
  const scopes = invoke(Model, 'scopes', sequelize) || {};
  const options = invoke(Model, 'options') || {};
  return Model.init(fields, { sequelize, hooks, scopes, ...options });
};

function initialize() {
  if (isProduction) return Promise.resolve();
  const umzug = new Umzug({
    storage: 'sequelize',
    storageOptions: {
      sequelize,
      tableName: config.migrationStorageTableName
    },
    migrations: {
      params: [sequelize.getQueryInterface(), Sequelize],
      path: migrationsPath
    }
  });

  return umzug.up();
}

const models = {
  User: defineModel(User)
};

forEach(models, model => {
  invoke(model, 'associate', models);
  invoke(model, 'addHooks', models);
});

const db = {
  Sequelize,
  sequelize,
  initialize,
  ...models
};

// Patch Sequelize#method to support getting models by class name.
sequelize.model = name => sequelize.models[name] || db[name];

module.exports = db;