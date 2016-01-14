var fs = require('fs');
var path = require('path');

function isDirRW(dirPath) {
    // fs.accessSync(fpath, fs.R_OK | fs.W_OK);
    fs.accessSync(dirPath, fs.R_OK);
    
    // Test write permissions
    var fname = path.join(dirPath, '/dummy_file_name_ASDFFGAJSDFASDFASDF');
    fs.appendFileSync(fname, "DUMMY CONTENT");
    fs.unlinkSync(fname);
}

exports.isDirRW = isDirRW;
