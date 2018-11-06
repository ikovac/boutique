'use strict';

const { Enrollment, Program, sequelize } = require('../common/database');
const pick = require('lodash/pick');

const { Op } = Sequelize;

const processInput = input => pick(input, ['name', 'startDate', 'endDate']);

function list({ query }, res) {
  const { name, deleted } = query;
  const where = {};
  if (name) where.name = { [Op.iLike]: name.trim() };
  return Program.findAll({ where, paranoid: !deleted })
    .then(programs => res.jsend.success(programs));
}

function get({ program }, res) {
  return res.jsend.success(program);
}

function create({ body }, res) {
  return Program.create(processInput(body))
    .then(program => res.jsend.success(program));
}

function patch({ body, program }, res) {
  return program.update(processInput(body))
    .then(program => res.jsend.success(program));
}

function destroy({ program }, res) {
  sequelize.transaction(async transaction => {
    await Enrollment.destroy({ where: { programId: program.id }, transaction });
    return res.jsend.success(await program.destroy({ transaction }));
  });
}

function getEnrolledPrograms({ user }, res) {
  const include = [{ model: Enrollment, where: { studentId: user.id } }];
  return Program.scope('active').findAll({ include })
    .then(programs => res.jsend.success(programs));
}

module.exports = {
  list,
  get,
  create,
  patch,
  destroy,
  getEnrolledPrograms
};
