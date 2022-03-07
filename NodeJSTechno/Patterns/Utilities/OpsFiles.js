'use strict';

const path = require('path');
const { mkdir, rmdir } = require('fs').promises;

// 
function getSourceFile(filename, addpath = '', prefix = '', postfix = '') {

    // source
    const filepath = path.join(__dirname, '..', 'Source');
    const getFull = () => path.join(filepath, filename);
    // dist
    const getDistname = () => `${prefix}${filename}${postfix}`;
    const getDistpath = () => addpath ? path.join(filepath, addpath) : filepath;
    const getDist = () => path.join(getDistpath(), getDistname());

    // 
    return {
        // source
        filename: filename,
        filepath: filepath,
        getFull: getFull,
        // dist
        getDistname: getDistname,
        getDistpath: getDistpath,
        getDist: getDist,
    }
}

// 
async function mkdirs(basepath, dirnames) {
    try {
        await Promise.all(
            dirnames.map(dirname => {
                mkdir(`${basepath}/${dirname}`)
                    .catch(err => console.info(`--- MKDIRS: ${err}`));
            })
        );
    }
    catch (err) {
        console.error(`--- MKDIRS: ${err}`);
    }
}

// 
async function rmdirs(basepath, dirnames) {
    try {
        await Promise.all(
            dirnames.map(dirname => {
                rmdir(`${basepath}/${dirname}`)
                    .catch(err => console.info(`--- RMDIRS: ${err}`));
            })
        );
    }
    catch (err) {
        console.error(`--- RMDIRS: ${err}`);
    }
}

// 
module.exports.getSourceFile = getSourceFile;
module.exports.mkdirs = mkdirs;
module.exports.rmdirs = rmdirs;