
// --- Шаблон: партизанское латание (monkey patching).

const patternExportingInstance = require('./PatternRevealingModule/patternExportingInstance.js');
patternExportingInstance.customMessage = () => console.log('This is a new functionality');