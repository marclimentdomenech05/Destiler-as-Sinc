const BASE='https://www.destilerias-sinc.com';
const sources=[
['Sant Cremat «Cremaet»','Licores','licor-cremaet-sant-cremat','ImgWeb_SantCremat_340x500-rn407ru05975uiz1c8pp44c6qcgh2epgeznu7x1lhc.jpg'],
['Herbero Dulce La Cava','Bebidas tradicionales','herbero-dulce-la-cava','ImgWeb_LaCava_340x500-1-rlzmllf4sj4onph5tqg3oyigob8tbaizcnn8n9ircw.jpg'],
['Ron Baoruco 21 Estuche','Ron','ron-baoruco-21-estuche','ImgWeb_Baoruco_340x500-rlzmpaw7r07egc3a6c54j0tx10yxob8v70a6sk0utc.jpg'],
['Vodka Icelandic Premium','Vodka','vodka-icelandic-premium','ImgWeb_Icelandic_340x500-rlzms3gy2a12ym16v1m7ftg8l977jxc58u3555vqbk.jpg'],
['Brandy Prestigio','Brandy','brandy-prestigio','ImgWeb_Prestigio_340x500-rlzmv2mjpe3rq5pjhbxoc2esb6j1xf5jnkghupgum8.jpg'],
['Absenta Serpis Classic 55','Absentas','absenta-serpis-classic-55-2','ImgWeb_Absenta_340x500-rn21in84vn3zcxww3lh17vhlu32i2dq45ryl6sqbcw.jpg'],
['Aperitivo Café Cerol Gourmet','Aperitivos café','aperitivo-cafe-cerol-gourmet','ImgWeb_Cerol_340x500-rlzmyvuzf7bmt8677z97g3s31fqn58acufpdx3tdds.jpg']];
const asset={
 patek1:'https://patek-res.cloudinary.com/dfsmedia/0906caea301d42b3b8bd23bd656d1711/303720-51882',
 patek2:'https://patek-res.cloudinary.com/dfsmedia/0906caea301d42b3b8bd23bd656d1711/303721-51882',
 jac1:'https://www.jacquemus.com/dw/image/v2/BJFJ_PRD/on/demandware.static/-/Library-Sites-JacquemusSharedLibrary/default/dw92af5083/002_SS23.jpg?sfrm=jpg&sw=1440',
 jac2:'https://www.jacquemus.com/dw/image/v2/BJFJ_PRD/on/demandware.static/-/Library-Sites-JacquemusSharedLibrary/default/dw529d7695/003_SS23.jpg?sfrm=jpg&sw=1440',
 jag1:'https://images.ctfassets.net/lzmdclvz8tzc/3V7tsdSTn124I8PTSYX4hN/8928e878a95e9a4ed0a6ecf1949813e6/AWWZ___Women_in_the_studio__1_.jpg?fm=webp&q=75&w=1000',
 jag2:'https://images.ctfassets.net/lzmdclvz8tzc/5SUXVixVbv7ipmkvOemXpn/c6b8426313b1178745843bda416c087f/Yawners_4__Tomavistas_2019_por_Ignacio_S_nchez-Su_rez__1_.jpg?fm=webp&q=75&w=1000',
 craft:BASE+'/wp-content/uploads/2024/01/Maestro-Destilador.jpg'};
sources.forEach((p,i)=>asset['product'+i]=BASE+'/wp-content/uploads/elementor/thumbs/'+p[3]);
const headers={'User-Agent':'Mozilla/5.0 (compatible; SINCArchive/1.0)','Accept':'image/avif,image/webp,image/*,*/*;q=0.8'};
async function fetchImage(url){let r=await fetch(url,{redirect:'error',headers,signal:AbortSignal.timeout(6500)});if(!r.ok||!/^image\/(jpeg|png|webp|gif|avif)/i.test(r.headers.get('content-type')||'')){await r.body?.cancel();throw Error('not image')}const bytes=Buffer.from(await r.arrayBuffer());if(bytes.length<500||bytes.length>6000000)throw Error('invalid image size');return {bytes,type:r.headers.get('content-type')}}
module.exports=async(req,res)=>{let key=req.query.asset;if(key){if(typeof key!=='string'||!Object.hasOwn(asset,key))return res.status(404).json({error:'Unknown asset'});try{let f=await fetchImage(asset[key]);res.setHeader('Content-Type',f.type);res.setHeader('Cache-Control','public, max-age=3600, s-maxage=86400');return res.send(f.bytes)}catch{return res.status(404).json({error:'Source image unavailable'})}}
if(req.query.check==='1'){const status=await Promise.all(Object.entries(asset).map(async([k,url])=>{try{let f=await fetchImage(url);return [k,{ok:true,bytes:f.bytes.length,type:f.type}]}catch{return [k,{ok:false}]}}));return res.json(Object.fromEntries(status))}
if(req.query.catalog==='1'){try{let products=[];for(let page=1;page<=8;page++){let r=await fetch(BASE+'/wp-json/wc/store/v1/products?per_page=100&page='+page,{signal:AbortSignal.timeout(6500),redirect:'error',headers:{Accept:'application/json'}});if(!r.ok)throw Error('catalog');let p=await r.json();if(!Array.isArray(p))throw Error('catalog');products.push(...p.map(x=>({id:x.id,title:x.name,url:x.permalink,media:x.images?.[0]?.src,category:x.categories?.map(c=>c.name).join(' / ')})));if(p.length<100||page>=Number(r.headers.get('x-wp-totalpages')||99))return res.json({complete:true,products});}return res.json({complete:false,products})}catch{return res.json({complete:false,products:sources.map((p,i)=>({title:p[0],category:p[1],url:BASE+'/producto/'+p[2]+'/',media:'/api/gallery?asset=product'+i}))})}}
return res.status(400).json({error:'Unknown request'})};