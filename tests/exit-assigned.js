async page => {
 await page.evaluate(()=>localStorage.removeItem('zhouji-demo-v1'));await page.reload();
 await page.locator('[data-role="worker"]').click();await page.locator('[data-page="wallet"]').click();await page.locator('[data-action="deposit"]').click();await page.locator('[name="agreed"]').check();await page.locator('dialog button[type="submit"]').click();
 await page.locator('[data-role="merchant"]').click();await page.locator('[data-page="orders"]').click();await page.locator('[data-action="assign"][data-id="ZJ1001"]').click();await page.locator('[name="worker"]').selectOption('w1');await page.locator('dialog button[type="submit"]').click();
 await page.locator('[data-role="worker"]').click();await page.locator('[data-page="wallet"]').click();await page.locator('[data-action="exit"]').click();await page.locator('dialog button[type="submit"]').click();await page.locator('[data-page="desk"]').click();
 const accept=page.locator('[data-action="accept"][data-id="ZJ1001"]');if(!await accept.isEnabled())throw new Error('退出前已派订单应能接受');await accept.click();
 const s=await page.evaluate(()=>JSON.parse(localStorage.getItem('zhouji-demo-v1')));if(s.orders.find(o=>o.id==='ZJ1001').status!=='serving')throw new Error('订单未开始');
 await page.evaluate(()=>localStorage.removeItem('zhouji-demo-v1'));await page.reload();
 return {passed:true,scenario:'退出前已派订单可继续履约'};
}
