const express = require('express')
const app = express()
const port = 3000
const bodyParser = require('body-parser');

const config = require('./config/key');
const {User} = require("./models/User");
app.use(express.json()) //For JSON requests
app.use(express.urlencoded({extended: true}));

const mongoose = require('mongoose')
mongoose
  .connect(config.mongoURI)
  .then(() => console.log("MongoDB Connected..."))
  .catch((err) => console.log(err));

app.get('/', (req, res) => {
  res.send('Hello World!12')
})
app.post('/register',(req,res)=>{   
  //회원가입할 때 필요한 정보들을 client에서 가져오면,
  //그 정보들을 DB에 넣어준다.
  const user = new User(req.body);
  //user모델에 정보가 저장됨
  //실패 시, 실패한 정보를 보내줌
  user.save().then(()=>{
      res.status(200).json({
          success:true
      })
  }).catch((err)=> res.json({success:false,err}));


})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})