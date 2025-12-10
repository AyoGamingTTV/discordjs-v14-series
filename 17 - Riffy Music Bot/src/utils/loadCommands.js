const fs = require('fs');
const path = require('path');

const isCommandFile = (file) => file.endsWith('.js');

const readCommandFiles = (dir) => {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...readCommandFiles(fullPath));
    } else if (isCommandFile(entry.name)) {
      files.push(fullPath);
    }
  }

  return files;
};

module.exports = (commandsPath) => {
  const commands = [];
  const files = readCommandFiles(commandsPath);

  for (const file of files) {
    const command = require(file);

    if (!command?.data || !command?.execute) {
      console.warn(`Skipping command at ${file} because it is missing data or execute.`);
      continue;
    }

    commands.push(command);
  }

  return commands;
};
