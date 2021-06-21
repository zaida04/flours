const rimraf = require('rimraf');
const {join} = require('path');

const packages = ['api', 'frontend'];
rimraf.sync(join(__dirname, '..', 'node_modules'));
console.log('Deleting root node_modules');

for (const package of packages) {
  rimraf.sync(join(__dirname, '..', 'services', package, 'node_modules'));
  console.log(`Deleting package ${package} node_modules`);
  rimraf.sync(join(__dirname, '..', 'services', package, 'dist'));
  console.log(`Deleting package ${package} dist`);
}
