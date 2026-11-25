module.exports=async function(req,res){
res.setHeader('Cache-Control','no-store');res.setHeader('Content-Type','application/json');
if(req.method!=='GET')return res.status(405).json({error:'method'});
const code=req.query.code;
if(typeof code!=='string'||!/^[a-zA-Z0-9]{5,20}$/.test(code))return res.status(400).json({error:'invalid pin code'});
const allowed=new Set(['pin.it','www.pinterest.com','pinterest.com','es.pinterest.com','www.pinterest.es','pinterest.es','www.pinterest.co.uk']);
let url=new URL('https://pin.it/'+code);
try{
for(let i=0;i<5;i++){
if(url.protocol!=='https:'||!allowed.has(url.hostname)||url.port||url.username||url.password)break;
const match=url.pathname.match(/^\/pin\/(\d+)\/?$/);if(match)return res.status(200).json({url:'https://www.pinterest.com/pin/'+match[1]+'/'});
let r=await fetch(url,{redirect:'manual',signal:AbortSignal.timeout(4500),headers:{'User-Agent':'Mozilla/5.0 (compatible; SINCArchive/1.0)'}});
let loc=r.headers.get('location');if(r.body)await r.body.cancel();if(!loc||r.status<300||r.status>=400)break;url=new URL(loc,url)
}
return res.status(422).json({error:'Pinterest no devolvió una URL pública de pin'});
}catch{return res.status(422).json({error:'Pinterest no accesible'})}
};