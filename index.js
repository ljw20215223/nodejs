const express = require('express')
const app = express()
const port = 3000
const bodyParser = require('body-parser');
const {auth} = require('./middleware/auth');
const cookieParser = require('cookie-parser');
const config = require('./config/key');
const {User} = require("./models/User");
app.use(express.json()) //For JSON requests
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());
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
app.post('/login',(req,res)=>{
  User.findOne({email: req.body.email})
    .then(docs=>{
        if(!docs){
            return res.json({
                loginSuccess: false,
                messsage: "제공된 이메일에 해당하는 유저가 없습니다."
            })
        }
        docs.comparePassword(req.body.password, (err, isMatch) => {
            if(!isMatch) return res.json({loginSuccess: false, messsage: "비밀번호가 틀렸습니다."})
    // Password가 일치하다면 토큰 생성
            docs.generateToken((err, user)=>{
                if(err) return res.status(400).send(err);
                // 토큰을 저장
                res.cookie("x_auth", user.token)
                .status(200)
                .json({loginSuccess: true, userId: user._id})
            })
        })
    })
    .catch((err)=>{
        return res.status(400).send(err);
    })
})

app.get('/auth',auth,(req, res)=>{
  res.status(200).json({
    _id: req.user._id,
    isAdmin: req.user.role === 0 ? false : true,
    isAuth: true,
    email: req.user.email,
    name: req.user.name,
    lastname: req.user.lastname,
    role: req.user.role,
    image: req.user.image
  })
})


app.get('/api/users/logout', auth,(req, res)=>{
  User.findOneAndUpdate({_id: req.user._id},{token: ""})
  .then((user)=>{
    return res.status(200).send({
      success: true
    });
  })
  .catch((err)=>{
    return res.json({success:false,err});
  })
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})