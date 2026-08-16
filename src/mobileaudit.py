"""Audit mobile like a real thumb: wobbly, slow presses. Every screen must respond."""
from playwright.sync_api import sync_playwright
import sys
sd='/private/tmp/claude-501/-Users-danielpowell/19917f01-3be2-495d-8ab5-cf24585ec2d1/scratchpad/'
fails=[]
with sync_playwright() as pw:
    b=pw.chromium.launch()
    ctx=b.new_context(**pw.devices['iPhone 13 landscape'])
    page=ctx.new_page()
    page.goto('file:///Users/danielpowell/tank-smashdown/index.html')
    page.wait_for_timeout(800)
    box=page.locator('canvas').bounding_box()
    cdp=ctx.new_cdp_session(page)
    def at(cx,cy): return (box['x']+cx/960*box['width'], box['y']+cy/600*box['height'])
    def sloppy_tap(cx,cy,wobble=22,hold=620):
        """finger lands, wobbles, lingers, lifts - the way people actually tap"""
        x,y=at(cx,cy)
        cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'x':x,'y':y,'id':1}]})
        page.wait_for_timeout(hold//2)
        cdp.send('Input.dispatchTouchEvent',{'type':'touchMove','touchPoints':[{'x':x+wobble,'y':y+wobble*0.6,'id':1}]})
        page.wait_for_timeout(hold//2)
        cdp.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]})
        page.wait_for_timeout(330)
    def st(): return page.evaluate("()=>state")
    def check(label,expect):
        got=st(); ok = got in expect
        if not ok: fails.append(f'{label}: got {got}, expected {expect}')
        print(f'  {label:.<34}{got:<12}{"OK" if ok else "FAIL"}')
        return ok
    print('SLOPPY-FINGER AUDIT (22px wobble, 620ms hold)')
    sloppy_tap(480,300); check('title -> mode', ['mode'])
    sloppy_tap(480,277); check('tap TANK BALL card', ['players'])
    sloppy_tap(330,245); check('tap SOLO', ['select'])
    sloppy_tap(120,120); check('tap a tank tile', ['select'])
    sloppy_tap(480,566); page.wait_for_timeout(1100); check('tap LOCK IN button', ['ready','play'])
    page.wait_for_timeout(2800)
    check('match running', ['play'])
    page.screenshot(path=sd+'audit-play.png')
    # back out and try the other screens
    page.evaluate("()=>{state='mode'}"); page.wait_for_timeout(200)
    sloppy_tap(186,140); check('QUICK DUEL card', ['difficulty'])
    sloppy_tap(480,260); check('difficulty card', ['select'])
    page.evaluate("()=>{state='mode'}"); page.wait_for_timeout(200)
    sloppy_tap(774,414); check('PROFILES card', ['profiles'])
    page.evaluate("()=>{state='mode'}"); page.wait_for_timeout(200)
    sloppy_tap(774,277); check('ZONE CONTROL card', ['players'])
    page.evaluate("()=>{state='mode'}"); page.wait_for_timeout(200)
    sloppy_tap(774,140); check('CAMPAIGN card', ['campmenu'])
    sloppy_tap(100,170); check('campaign stage tile', ['select'])
    print('MOBILE-AUDIT-OK' if not fails else 'FAILURES:\n  '+'\n  '.join(fails))
    b.close()
sys.exit(1 if fails else 0)
