const esprima = require('esprima');
const fs = require('fs');

function findNodes(sourceCode) {
  const result = [];
  esprima.parse(sourceCode, { jsx: true }, function (node) {
    if (node.type !== 'CallExpression') {
      return;
    }

    if (node.callee.type !== 'Identifier') {
      return;
    }

    if (node.callee.name !== 'require') {
      return;
    }

    if (node.arguments.length !== 1) {
      console.log(node);
      throw new Error("Not exactly one argument");
    }

    const arg = node.arguments[0];

    if (arg.type !== 'Literal' || typeof arg.value !== 'string') {
      console.log(node);
      throw new Error("Expected string literal - not found");
    }

    result.push(arg.value);
  });

  return result;
}

// const sourceCode = fs.readFileSync(__dirname + '/../src/App.js', 'utf-8');
// console.log(findNodes(sourceCode));

module.exports = findNodes;
