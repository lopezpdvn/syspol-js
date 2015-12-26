var fs = require('fs');

function checkDir(dirPath) {
    //fs.accessSync(fpath, fs.R_OK | fs.W_OK);
    fs.accessSync(dirPath, fs.R_OK);
    
    // test write permissions
    var fname = dirPath + '/dummy_file_name_ASDFFGAJSDFASDFASDF';
    fs.appendFileSync(fname, "DUMMY CONTENT");
    fs.unlinkSync(fname);
}

exports.checkDir = checkDir;