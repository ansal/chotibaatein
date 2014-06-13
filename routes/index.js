
/*
 * GET home page.
 */

exports.index = function(req, res){
  if(!req.user) {
    res.render('index.jade');
    return;
  }
  res.redirect('/app');
};