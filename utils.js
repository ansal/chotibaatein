// Utility methods used through out the program

// function to check whether a user is logged in or not
exports.restrictUser = function(req, res, next) {
  if(req.isAuthenticated()) {
    next();
  } else {
    res.redirect('/?loggedOut=true');
  }
};