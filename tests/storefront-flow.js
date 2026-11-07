async page => {
 const checks=[];const check=(v,n)=>{if(!v)throw new Error(n);checks.push(n);};
 const click=(action,id)=>page.locator(`[data-action="${action}"]${id?`[data-id="${id}"]`:''}`).first().click();
 await page.evaluate(()=>{localStorage.removeItem('zhouji-demo-v1');localStorage.removeItem('zhouji-shop-prefs');});await page.reload();await page.setViewportSize({width:390,height:844});await page.locator('[data-role="player"]').click();
 check(await page.locator('.store-product').count()===6,'旧版和新套餐合计六款');
 let columns=await page.locator('.store-products').evaluate(el=>getComputedStyle(el).gridTemplateColumns.split(' ').length);check(columns===2,'手机双列真实显示两列');
 await click('shopLayout','single');columns=await page.locator('.store-products').evaluate(el=>getComputedStyle(el).gridTemplateColumns.split(' ').length);check(columns===1,'单列模式显示一列');
 await page.reload();await page.locator('[data-role="player"]').click();check(await page.locator('.store-products.single').count()===1,'刷新后保留单列选择');
 await click('shopCategory','教学');check(await page.locator('.store-product').count()===3,'教学筛选');
 await page.locator('#shopSearch').fill('撤离训练');check(await page.locator('.store-product').count()===1,'搜索与分类组合生效');
 await page.locator('#shopSearch').fill('不存在的套餐');check(await page.locator('.store-empty').isVisible(),'搜索无结果有提示');await click('clearStore');
 await page.locator('#shopSort').selectOption('asc');check(await page.locator('.store-product').first().getAttribute('data-product')==='p4','价格升序');
 await click('favorite','p4');await click('shopCategory','收藏');check(await page.locator('.store-product').count()===1,'收藏筛选');await click('favorite','p4');check(await page.locator('.store-empty').isVisible(),'取消最后一项收藏有空态');await click('clearStore');
 await click('game','mobile');await click('buy','p4');check(await page.locator('[name="platform"]').inputValue()==='手游','手游选择传入下单表单');await page.locator('[name="gameId"]').fill('QA_Mobile');await page.locator('dialog input[type="checkbox"]').check();await page.locator('dialog button[type="submit"]').click();
 let s=await page.evaluate(()=>JSON.parse(localStorage.getItem('zhouji-demo-v1')));check(s.orders[0].price===5800&&s.orders[0].platform==='手游','新增套餐可下单且价格与平台正确');
 await page.locator('[data-role="merchant"]').click();await page.locator('[data-page="products"]').click();await click('toggleProduct','p4');await page.locator('[data-role="player"]').click();check(await page.locator('[data-product="p4"]').count()===0,'新套餐后台下架同步商城');
 await click('shopLayout','double');await page.locator('#catalog').scrollIntoViewIfNeeded();await page.screenshot({path:'mobile-double.png'});
 await click('shopLayout','single');await page.locator('#catalog').scrollIntoViewIfNeeded();await page.screenshot({path:'mobile-single.png'});
 for(const width of [320,390,430]){await page.setViewportSize({width,height:844});for(const layout of ['single','double']){await click('shopLayout',layout);check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${width}px ${layout} 无横向溢出`);}}
 await page.evaluate(()=>{localStorage.removeItem('zhouji-demo-v1');localStorage.removeItem('zhouji-shop-prefs');});await page.reload();await page.setViewportSize({width:390,height:844});await page.locator('[data-role="player"]').click();await page.locator('#catalog').scrollIntoViewIfNeeded();await page.screenshot({path:'mobile-double.png'});await click('shopLayout','single');await page.locator('#catalog').scrollIntoViewIfNeeded();await page.screenshot({path:'mobile-single.png'});
 return {passed:checks.length,checks};
}
