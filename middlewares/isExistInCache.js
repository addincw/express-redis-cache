const redis = require('redis')
const redisClient = redis.createClient()

module.exports = function(request, response, next) {
    redisClient.hgetall(request.body.username, function (error, user) {
        if(error) throw error

        if(user) {
            response.render('detail', { user })
            return
        } 
        
        next()
    })
}