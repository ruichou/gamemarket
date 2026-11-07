export const schema=1;
export function seed(){return {schema,seq:1004,settings:{name:'洲际电竞',deposit:50000},workers:[{id:'w1',name:'北辰',skill:'三角洲 · 地图教学',approved:true,balance:0,exit:'none'},{id:'w2',name:'山海',skill:'三角洲 · 双人组队',approved:true,balance:50000,exit:'none'},{id:'w3',name:'青禾',skill:'三角洲 · 新手陪练',approved:false,balance:0,exit:'none'}],products:[{id:'p1',title:'新兵入场 · 地图教学',tag:'新手推荐',desc:'熟悉路线、资源点与撤离机制，边玩边学。',price:6800,unit:'60分钟',type:'教学',active:true},{id:'p2',title:'双人协同 · 组队陪玩',tag:'人气套餐',desc:'一位陪玩与你组队，沟通配合，体验完整对局。',price:9900,unit:'3局',type:'陪玩',active:true},{id:'p3',title:'战术进阶 · 对局复盘',tag:'进阶训练',desc:'从路线规划到交战决策，梳理你的对局思路。',price:12800,unit:'90分钟',type:'教学',active:true}],orders:[{id:'ZJ1001',product:'新兵入场 · 地图教学',price:6800,player:'演示玩家',gameId:'Delta_1024',platform:'PC端',map:'零号大坝',note:'第一次玩，希望讲解路线',status:'paid',worker:null,record:'',dispute:null},{id:'ZJ1002',product:'双人协同 · 组队陪玩',price:9900,player:'演示玩家',gameId:'Delta_2048',platform:'手游',map:'长弓溪谷',note:'希望多交流',status:'serving',worker:'w2',record:'',dispute:null},{id:'ZJ1003',product:'战术进阶 · 对局复盘',price:12800,player:'演示玩家',gameId:'Delta_4096',platform:'PC端',map:'零号大坝',note:'复盘路线选择',status:'completed',worker:'w2',record:'已完成90分钟复盘，讲解两条撤离路线。',dispute:null}],ledger:[{id:'L1000',worker:'w2',amount:50000,kind:'缴纳',at:'演示初始记录',note:'保证金规则 v1，模拟支付成功'}],refunds:[],logs:[]};}
const fail=m=>{throw new Error(m)};
export const activeOrder=o=>['assigned','serving','review','disputed'].includes(o.status);
export function eligible(s,w){return w.approved&&w.balance>=s.settings.deposit&&w.exit==='none';}
export function canAcceptAssigned(s,w){return w.approved&&w.balance>=s.settings.deposit&&['none','requested'].includes(w.exit);}
export function blockers(s,id){return s.orders.filter(o=>o.worker===id&&activeOrder(o));}
export function refundable(s,w){return w.balance;}
export function mutate(old,type,p={},role='merchant'){
 const s=structuredClone(old),now=new Date().toLocaleString('zh-CN'),id=()=>String(s.seq++);
 const w=()=>s.workers.find(x=>x.id===p.worker)||fail('服务人员不存在');
 const o=()=>s.orders.find(x=>x.id===p.order)||fail('订单不存在');
 const allow=roles=>{if(!roles.includes(role))fail('当前角色不能执行这项操作');};
 const log=text=>s.logs.unshift({id:id(),at:now,role,text});
 const entry=(worker,amount,kind,note)=>s.ledger.unshift({id:'L'+id(),worker,amount,kind,note,at:now});
 const request=(kind,amount,extra)=>{const r={id:'R'+id(),kind,amount,status:'requested',at:now,...extra};s.refunds.unshift(r);return r;};
 switch(type){
 case 'create':{allow(['player']);const product=s.products.find(x=>x.id===p.product&&x.active)||fail('套餐已下架');if(!p.gameId?.trim())fail('请填写游戏角色ID');const order={id:'ZJ'+id(),product:product.title,price:product.price,player:'演示玩家',gameId:p.gameId.trim().slice(0,60),platform:p.platform,map:p.map,note:(p.note||'').slice(0,200),status:'unpaid',worker:null,record:'',dispute:null};s.orders.unshift(order);log('创建订单 '+order.id);break;}
 case 'pay':{allow(['player']);const order=o();if(order.status!=='unpaid')fail('订单不是待支付状态');order.status='paid';log('模拟支付成功 '+order.id);break;}
 case 'cancel':{allow(['player']);const order=o();if(order.status!=='unpaid')fail('只能取消待支付订单');order.status='cancelled';log('取消订单 '+order.id);break;}
 case 'approveWorker':{allow(['merchant']);w().approved=true;log('审核通过 '+w().name);break;}
 case 'deposit':{allow(['worker']);const worker=w();if(!worker.approved)fail('请先等待商家审核');if(worker.exit!=='none')fail('退出或退款期间不能缴纳保证金');if(!p.agreed)fail('请先阅读并同意保证金规则');const amount=s.settings.deposit-worker.balance;if(amount<=0)fail('保证金已经足额');worker.balance+=amount;entry(worker.id,amount,'缴纳','规则 v1；模拟支付成功');log(worker.name+' 缴纳保证金 '+amount/100+'元');break;}
 case 'assign':{allow(['merchant']);const order=o(),worker=w();if(!['paid','assigned'].includes(order.status))fail('只有待安排或待接单订单可以派单');if(!eligible(s,worker))fail('人员未审核、保证金不足或正在退出，不能派单');order.worker=worker.id;order.status='assigned';log(order.id+' 派给 '+worker.name);break;}
 case 'accept':{allow(['worker']);const order=o();if(order.worker!==p.worker||order.status!=='assigned')fail('无法接取这笔订单');if(!canAcceptAssigned(s,w()))fail('未审核、保证金不足或正在退款，不能接单');order.status='serving';log(order.id+' 开始服务');break;}
 case 'decline':{allow(['worker']);const order=o();if(order.worker!==p.worker||order.status!=='assigned')fail('无法拒绝这笔订单');order.worker=null;order.status='paid';log(order.id+' 人员退回，等待重新安排');break;}
 case 'submit':{allow(['worker']);const order=o();if(order.worker!==p.worker||order.status!=='serving')fail('订单不是你的服务中订单');if(!p.record?.trim())fail('请填写服务完成记录');order.record=p.record.trim().slice(0,1000);order.status='review';log(order.id+' 提交验收');break;}
 case 'complete':{allow(['player']);const order=o();if(order.status!=='review')fail('订单尚未提交验收');order.status='completed';log(order.id+' 玩家确认完成');break;}
 case 'refundOrder':{allow(['player']);const order=o();if(!['paid','assigned','serving','review','completed'].includes(order.status))fail('当前订单不能申请退款');if(s.refunds.some(r=>r.order===order.id&&['requested','processing','failed'].includes(r.status)))fail('已有退款申请');if(!p.reason?.trim())fail('请填写退款原因');order.previous=order.status;order.status='disputed';order.dispute=p.reason.trim().slice(0,300);request('order',order.price,{order:order.id,reason:order.dispute});log(order.id+' 申请售后');break;}
 case 'exit':{allow(['worker']);const worker=w();if(worker.exit!=='none'||worker.balance<=0)fail('当前没有可申请退还的保证金');worker.exit='requested';request('deposit',worker.balance,{worker:worker.id,reason:'申请退出接单并退还保证金'});log(worker.name+' 申请退出，停止新派单');break;}
 case 'approveRefund':{allow(['merchant']);const r=s.refunds.find(x=>x.id===p.refund)||fail('退款单不存在');if(!['requested','failed'].includes(r.status))fail('退款单已处理');if(r.kind==='deposit'){const worker=s.workers.find(x=>x.id===r.worker);if(blockers(s,worker.id).length)fail('仍有未完成订单或纠纷，请处理后再退还');if(worker.balance<r.amount)fail('保证金余额不足');worker.exit='processing';}r.status='processing';log(r.id+' 已审核，模拟退款处理中');break;}
 case 'finishRefund':{allow(['merchant']);const r=s.refunds.find(x=>x.id===p.refund)||fail('退款单不存在');if(r.status!=='processing')fail('退款不在处理中，不能重复确认');if(p.failed){r.status='failed';r.error='模拟渠道失败，资金尚未退还';if(r.kind==='deposit')s.workers.find(x=>x.id===r.worker).exit='failed';log(r.id+' 模拟退款失败');break;}r.status='success';if(r.kind==='deposit'){const worker=s.workers.find(x=>x.id===r.worker);if(blockers(s,worker.id).length)fail('仍有未完成订单，不能退还');worker.balance-=r.amount;worker.exit='exited';entry(worker.id,-r.amount,'退还',r.id+'；模拟渠道确认成功');}else{s.orders.find(x=>x.id===r.order).status='refunded';}log(r.id+' 模拟退款成功');break;}
 case 'rejectRefund':{allow(['merchant']);const r=s.refunds.find(x=>x.id===p.refund)||fail('退款单不存在');if(r.status!=='requested')fail('只能处理待审核申请');if(!p.reason?.trim())fail('必须填写处理理由');r.status='rejected';r.reply=p.reason.trim().slice(0,300);if(r.kind==='deposit')s.workers.find(x=>x.id===r.worker).exit='none';else{const order=s.orders.find(x=>x.id===r.order);order.status=order.previous;order.dispute=null;}log(r.id+' 未通过：'+r.reply);break;}
 case 'returnWorker':{allow(['worker']);if(w().exit!=='exited')fail('当前不能重新入驻');w().exit='none';log(w().name+' 重新申请接单，请补缴保证金');break;}
 case 'toggleProduct':{allow(['merchant']);const product=s.products.find(x=>x.id===p.product)||fail('套餐不存在');product.active=!product.active;log(product.title+(product.active?' 上架':' 下架'));break;}
 case 'editProduct':{allow(['merchant']);const product=s.products.find(x=>x.id===p.product)||fail('套餐不存在');if(!p.title?.trim()||!Number.isSafeInteger(p.price)||p.price<=0||p.price>10000000)fail('请填写名称及有效价格');product.title=p.title.trim().slice(0,60);product.price=p.price;log('修改套餐 '+product.title+'；历史订单价格保持不变');break;}
 default:fail('未知操作');
 }
 return s;
}
