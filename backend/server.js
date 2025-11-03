// Simple Express backend for GymFlex demo
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const QRCode = require('qrcode');

const app = express();
app.use(cors());
app.use(express.json());

const DB_PATH = path.join(__dirname, 'db.json');
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

function readDB(){
  if(!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify({users:[], gyms:[], visits:[]}, null, 2));
  }
  return JSON.parse(fs.readFileSync(DB_PATH));
}
function writeDB(db){ fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2)); }

app.post('/api/register', async (req,res)=>{
  const {email, password, name} = req.body;
  if(!email || !password) return res.status(400).json({error:'email and password required'});
  const db = readDB();
  if(db.users.find(u=>u.email===email)) return res.status(400).json({error:'user exists'});
  const hash = await bcrypt.hash(password, 8);
  const user = {id: 'u'+Date.now(), email, password: hash, name: name||'', role:'user', created: new Date().toISOString()};
  db.users.push(user);
  writeDB(db);
  const token = jwt.sign({id:user.id, email:user.email, role:user.role}, JWT_SECRET, {expiresIn:'30d'});
  res.json({token, user:{id:user.id,email:user.email,name:user.name,role:user.role}});
});

app.post('/api/login', async (req,res)=>{
  const {email,password} = req.body;
  const db = readDB();
  const user = db.users.find(u=>u.email===email);
  if(!user) return res.status(400).json({error:'invalid'});
  const match = await bcrypt.compare(password, user.password);
  if(!match) return res.status(400).json({error:'invalid'});
  const token = jwt.sign({id:user.id, email:user.email, role:user.role}, JWT_SECRET, {expiresIn:'30d'});
  res.json({token, user:{id:user.id,email:user.email,name:user.name,role:user.role}});
});

function auth(req,res,next){
  const h = req.headers.authorization;
  if(!h) return res.status(401).json({error:'no auth'});
  const token = h.split(' ')[1];
  try{
    const data = jwt.verify(token, JWT_SECRET);
    req.user = data;
    next();
  }catch(e){ return res.status(401).json({error:'invalid token'}); }
}

app.get('/api/gyms', (req,res)=>{
  const db = readDB();
  res.json(db.gyms);
});

app.post('/api/gyms', auth, (req,res)=>{
  if(req.user.role !== 'admin') return res.status(403).json({error:'forbidden'});
  const {name, lat, lon, type, load} = req.body;
  const db = readDB();
  const gym = {id:'g'+Date.now(), name, lat, lon, type, load: load||0, created:new Date().toISOString()};
  db.gyms.push(gym);
  writeDB(db);
  res.json(gym);
});

app.post('/api/buy', auth, (req,res)=>{
  const {type} = req.body;
  const db = readDB();
  const user = db.users.find(u=>u.id===req.user.id);
  if(!user) return res.status(400).json({error:'user not found'});
  user.pass = {type:type||'demo', remaining: type==='everyday'?30:5, purchased: new Date().toISOString(), expires: new Date(Date.now()+30*24*3600*1000).toISOString()};
  writeDB(db);
  res.json({ok:true, pass:user.pass});
});

app.get('/api/qr', auth, async (req,res)=>{
  const db = readDB();
  const user = db.users.find(u=>u.id===req.user.id);
  if(!user) return res.status(400).json({error:'user not found'});
  const code = `GF-${user.id}-${Math.floor(Math.random()*10000)}`;
  const png = await QRCode.toDataURL(code);
  res.json({code, png});
});

app.post('/api/scan', auth, (req,res)=>{
  if(req.user.role !== 'admin') return res.status(403).json({error:'forbidden'});
  const {code, gymId} = req.body;
  const db = readDB();
  const parts = code.split('-');
  const userId = parts[1] || null;
  const user = db.users.find(u=>u.id===userId);
  if(!user) return res.status(400).json({error:'user not found'});
  if(user.pass && user.pass.remaining>0){ user.pass.remaining -= 1; }
  const visit = {id:'v'+Date.now(), userId:user.id, gymId:gymId||null, time:new Date().toISOString()};
  db.visits.push(visit);
  writeDB(db);
  res.json({ok:true, visit, remaining: user.pass?user.pass.remaining:null});
});

app.post('/api/setup-admin', async (req,res)=>{
  const {email,password,name} = req.body;
  const db = readDB();
  if(db.users.find(u=>u.email===email)) return res.json({ok:true, msg:'exists'});
  const hash = await bcrypt.hash(password,8);
  const admin = {id:'u'+Date.now(), email, password:hash, name:name||'Admin', role:'admin', created:new Date().toISOString()};
  db.users.push(admin);
  writeDB(db);
  res.json({ok:true, admin:{id:admin.id,email:admin.email,name:admin.name}});
});

app.get('/api/health', (req,res)=>res.json({ok:true, time:new Date().toISOString()}));

const PORT = process.env.PORT || 4000;
app.listen(PORT, ()=> console.log('GymFlex API running on', PORT));
