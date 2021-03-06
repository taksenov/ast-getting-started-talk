const usedClassesFromJS = require('./used-classes-from-js');
const definedClassesFromCSS = require('./defined-classes-from-css');
const fs = require('fs');
const path = require('path');
const child_process = require('child_process')

const globalUsedClasses = {};
const globalDefinedClasses = {};

function gatherUsedCSSClasses(filepath) {
  const sourceCode = fs.readFileSync(filepath, 'utf-8');
  const dirname = path.dirname(filepath);
  const { declToClassToUsed, declToPath } = usedClassesFromJS(sourceCode);

  for (const declName in declToPath) {
    const cssPath = path.resolve(dirname, declToPath[declName]);
    globalUsedClasses[cssPath] = globalUsedClasses[cssPath] || {};
    const usedClasses = declToClassToUsed[declName];

    for (const usedClassName in usedClasses) {
      globalUsedClasses[cssPath][usedClassName] = true;
    }
  }
}

function gatherDefinedCSSClasses(filepath) {
  const sourceCode = fs.readFileSync(filepath, 'utf-8');
  const classToUsed = definedClassesFromCSS(sourceCode);

  globalDefinedClasses[filepath] = {};

  for (const className in classToUsed) {
    globalDefinedClasses[filepath][className] = true;
  }
}

// Cперва собираем статистику по использованным классам
child_process.execSync('git ls-files')
  .toString()
  .split('\n')
  .filter(function (file) {
    return file.match(/^src/) && file.match(/\.js$/);
  })
  .map(function (relative) { return path.resolve(relative); })
  .forEach(function (path) {
    gatherUsedCSSClasses(path);
  });

// Потом собираем статистику по объявленным классам
child_process.execSync('git ls-files')
  .toString()
  .split('\n')
  .filter(function (file) {
    return file.match(/^src/) && file.match(/\.css$/);
  })
  .map(function (relative) { return path.resolve(relative); })
  .forEach(function (path) {
    gatherDefinedCSSClasses(path);
  });

console.log('globalUsedClasses: \n', globalUsedClasses);
console.log('globalDefinedClasses: \n', globalUsedClasses);

// Наконец, циклом вычисляем неиспользованные
for (const cssPath in globalDefinedClasses) {
  const definedClasses = globalDefinedClasses[cssPath];

  if (!globalUsedClasses[cssPath]) {
    console.log('File ' + path.relative(process.cwd(), cssPath) + ' not used at all');
    continue;
  }

  for (const className in definedClasses) {
    if (!globalUsedClasses[cssPath][className]) {
      console.log(`Not used .${className} in ${path.relative(process.cwd(), cssPath)}`)
    }
  }
}
