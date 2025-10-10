const app = require('./app')

const {PORT = 9090} = process.env

app.listen(PORT, (err: any)=>{
    if(err){
        console.log(err)
    }else{
        console.log(`Listening on port ${PORT}...`)
    }
})
