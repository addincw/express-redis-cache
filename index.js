const express = require('express')
const expressLayouts = require('express-ejs-layouts')
const redis = require('redis')
const fetch = require('node-fetch')

const isExistInCache = require('./middlewares/isExistInCache')

//create connection to Redis
const redisClient = redis.createClient()
redisClient.on('connect', function() {
    console.log('connected on redis..')
})

const app = express()
//handle request
app.use(express.urlencoded({ extended: false }))
//set template engine
app.use(expressLayouts)
app.set('view engine', 'ejs')
//routes
app.get('/', (request, response) => {
    response.render('index')
})
app.post('/', isExistInCache, async (request, response) => {
    console.log('fetching data to github..')

    const { username } = request.body
    const getRepos = await fetch(`https://api.github.com/users/${username}`)
    const repos = await getRepos.json()
    const params = [
        'username', repos.login,
        'name', repos.name,
        'public_repos', repos.public_repos
    ]

    redisClient.hmset(username, params, function(error, done) {
        if(error) {
            response.redirect('/')
            return
        }

        redisClient.expire(username, 3600)
        response.render('detail', { user: {username: params[1], name: params[3], public_repos: params[5]} })
    })
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`Server running on port : ${PORT}`))