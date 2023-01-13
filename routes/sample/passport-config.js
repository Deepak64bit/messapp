const LocalStrategy = require('passport-local').Strategy

function initialize(passport, getUserById){
    const authenticateUser = async (userID, password, done) => {
        const user = getUserById(userID)

        if(user==null){
            return done(null, false, { message : 'No user with that userID'})
        }

        try{
            if(await bcrypt.compare(password, user.password)){
                return done(null, user)
            } else{
                return done(null, false, { message: 'Password incorrect'})
            }
        } catch(e) {
            return done(e)
        }
    }

    passport.use(new LocalStrategy({ usernameField: 'userID' }, authenticateUser))
    passport.serializeUser((user,done)=> done(null, user.id))
    passport.deserializeUser((id,done)=> {
        return done(null, getUserById(id))
    })
}

module.exports = initialize