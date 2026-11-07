async page => {
 await page.reload();
 await page.setViewportSize({width:390,height:844});
 await page.locator('[data-role="player"]').click();
 await page.screenshot({path:'mobile-shop.png',fullPage:true});
 const noOverflow=await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth);
 await page.setViewportSize({width:1440,height:960});
 await page.locator('[data-role="merchant"]').click();
 await page.screenshot({path:'desktop.png',fullPage:true});
 await page.locator('[data-page="deposits"]').click();
 await page.screenshot({path:'desktop-deposits.png',fullPage:true});
 return {noOverflow};
}
