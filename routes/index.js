
/*
 * GET home page.
 */

exports.index = function(req, res){
  if(!req.user) {
    res.send('Not logged in yet!');
    return;
  }
  res.redirect('/app');
};