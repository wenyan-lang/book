var { NUMBER_KEYWORDS, KEYWORDS } = require("@wenyanlang/core")

var semantic = function(txt) {
  var off = 0;
  var out = [];
  var i = 0;
  while (i < txt.length) {
    if (txt[i] == "「" || txt[i] == "『") {
      off++;
      if (out[out.length-1] == "comment"){
        out.push("comment");
      }else{
        out.push("quot");
      }
    } else if (txt[i] == "」" || txt[i] == "』") {
      off--;
      if (out[out.length-1] == "comment"){
        out.push("comment");
      }else{
        out.push("quot");
      }
    } else {
      if (off) {
        if (out[out.length-1] == "comment"){
          out.push("comment");
        }else{
          out.push("iden");
        }
      } else {
        var ok = false;
        for (var k in KEYWORDS) {
          ok = true;
          for (var j = 0; j < k.length; j++) {
            if (k[j] != txt[i + j]) {
              ok = false;
              break;
            }
          }
          if (ok) {
            for (var j = 0; j < k.length; j++) {
              out.push(KEYWORDS[k][0]);
              i++;
            }
            i--;
            break;
          }
        }
        if (ok == false) {
          if (NUMBER_KEYWORDS.includes(txt[i])) {
            out.push("num");
          } else {
            out.push("data");
          }
        }
      }
    }
    i++;
  }
  return out;
};

module.exports = semantic;
